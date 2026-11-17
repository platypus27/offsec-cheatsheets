import { parse } from 'yaml'
import type { Content } from './content'
import { asRecord, isStringArray } from './guards'
import { commandChunk } from './playbooks'

export interface Recipe {
  ref: string
  tools: string[]
  services: string[]
  phase: string
}

/** Catalogue entries reference authored headings; commands and context have one owner. */
export function parseRecipes(source: string, content: Content): { recipes: Recipe[]; errors: string[] } {
  if (!source.trim()) return { recipes: [], errors: [] }
  let data: unknown
  try {
    data = parse(source)
  } catch (error) {
    return { recipes: [], errors: [`Invalid YAML: ${String(error)}`] }
  }
  if (!Array.isArray(data)) return { recipes: [], errors: ['Expected a list of command groups'] }
  const recipes: Recipe[] = []
  const errors: string[] = []
  const seen = new Set<string>()
  for (const [index, value] of data.entries()) {
    const item = asRecord(value)
    const prefix = `Entry ${index + 1}`
    const unknown = Object.keys(item).filter((key) => !['ref', 'tools', 'services', 'phase'].includes(key))
    if (unknown.length) {
      errors.push(`${prefix}: unknown field ${unknown.join(', ')}`)
      continue
    }
    if (
      typeof item.ref !== 'string' ||
      !item.ref.includes('#') ||
      typeof item.phase !== 'string' ||
      !item.phase.trim() ||
      !isStringArray(item.tools) ||
      !item.tools.length ||
      !item.tools.every((tool) => tool.trim()) ||
      !isStringArray(item.services) ||
      !item.services.length ||
      !item.services.every((service) => service.trim())
    ) {
      errors.push(`${prefix}: needs a heading ref, phase, non-empty tools and services`)
      continue
    }
    const chunk = commandChunk(item.ref, content)
    if (!chunk?.blocks.length) {
      errors.push(`${prefix}: ${item.ref} must resolve to a heading with commands`)
      continue
    }
    if (seen.has(item.ref)) {
      errors.push(`${prefix}: duplicate reference ${item.ref}`)
      continue
    }
    seen.add(item.ref)
    recipes.push({ ref: item.ref, tools: item.tools, services: item.services, phase: item.phase.trim() })
  }
  return { recipes, errors }
}
