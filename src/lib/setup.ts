import { parse as parseYaml } from 'yaml'
import { asRecord } from './guards'

export interface SetupItem {
  id: string
  title: string
  description: string
  destination: string
  command: string
  verify: string
}

export interface SetupSection {
  id: string
  title: string
  description: string
  items: SetupItem[]
}

const ID = /^[A-Za-z0-9_-]+$/
const text = (value: unknown) => (typeof value === 'string' ? value.trim() : '')
const fixedDestination = (value: string) => value === 'PATH' || /^\/home\/kali\/tools(?:\/|$)/.test(value)

export function parseSetup(source: string): { sections: SetupSection[]; errors: string[] } {
  if (!source.trim()) return { sections: [], errors: ['Setup needs at least one section'] }
  let data: unknown
  try {
    data = parseYaml(source)
  } catch (error) {
    return {
      sections: [],
      errors: [
        `Could not read setup YAML: ${error instanceof Error ? error.message.split('\n')[0] : 'syntax error'}`,
      ],
    }
  }

  const rawSections = asRecord(data).sections
  if (!Array.isArray(rawSections) || rawSections.length === 0) {
    return { sections: [], errors: ['Setup needs at least one section'] }
  }

  const errors: string[] = []
  const sectionIds = new Set<string>()
  const itemIds = new Set<string>()
  const sections: SetupSection[] = []
  rawSections.forEach((rawSection, sectionIndex) => {
    const section = asRecord(rawSection)
    const id = text(section.id)
    const title = text(section.title)
    const where = `Section ${id || sectionIndex + 1}`
    if (!ID.test(id)) errors.push(`${where}: needs a valid id`)
    if (sectionIds.has(id)) errors.push(`${where}: duplicate section id`)
    if (!title) errors.push(`${where}: needs a title`)
    sectionIds.add(id)
    if (!Array.isArray(section.items) || section.items.length === 0) {
      errors.push(`${where}: needs at least one item`)
      return
    }

    const items: SetupItem[] = []
    section.items.forEach((rawItem, itemIndex) => {
      const item = asRecord(rawItem)
      const itemId = text(item.id)
      const itemTitle = text(item.title)
      const command = text(item.command)
      const verify = text(item.verify)
      const destination = text(item.destination)
      const label = `${where}, item ${itemIndex + 1}`
      if (!ID.test(itemId)) errors.push(`${label}: needs a valid id`)
      if (!itemTitle) errors.push(`${label}: needs a title`)
      if (!command) errors.push(`${label}: needs a non-empty command`)
      if (!fixedDestination(destination)) {
        errors.push(`${label}: destination must be PATH or an absolute /home/kali/tools path`)
      }
      if (!verify) errors.push(`${label}: needs a verification command`)
      if (itemIds.has(itemId)) errors.push(`${label}: duplicate item id "${itemId}"`)
      itemIds.add(itemId)
      items.push({
        id: itemId,
        title: itemTitle,
        description: text(item.description),
        destination,
        command,
        verify,
      })
    })
    sections.push({ id, title, description: text(section.description), items })
  })

  return errors.length ? { sections: [], errors } : { sections, errors }
}
