import { parse as parseYaml } from 'yaml'
import type { Content } from './content'
import type { ScannedPort } from './nmap'
import { asRecord, isStringArray } from './guards'
import { refProblem } from './refs'

export interface Rule {
  id: string
  title: string
  ports: number[]
  services: string[]
  versions: RegExp[]
  suggest: string[]
  note: string
}

export interface Suggestion {
  rule: Rule
  ports: ScannedPort[]
}

const ID = /^[a-z0-9][a-z0-9-]*$/i

/**
 * Reads the user's suggestion rules. Each rule maps open ports (by number,
 * service-name substring or version regex) to pages in the notes. Bad rules
 * are skipped with a readable error rather than breaking the parser page.
 */
export function parseRules(source: string): { rules: Rule[]; errors: string[] } {
  let data: unknown
  try {
    data = parseYaml(source)
  } catch (error) {
    return {
      rules: [],
      errors: [
        `Could not read rules YAML: ${error instanceof Error ? error.message.split('\n')[0] : 'syntax error'}`,
      ],
    }
  }
  if (data == null) return { rules: [], errors: [] }
  if (!Array.isArray(data)) return { rules: [], errors: ['Rules must be a YAML list'] }

  const rules: Rule[] = []
  const errors: string[] = []
  const seen = new Set<string>()
  data.forEach((raw, index) => {
    const item = asRecord(raw)
    const label = `Rule ${index + 1}`
    const id = typeof item.id === 'string' ? item.id : ''
    if (!ID.test(id)) return errors.push(`${label}: needs an "id" made of letters, digits and dashes`)
    const where = `${label} (${id})`
    if (seen.has(id)) return errors.push(`${where}: duplicate id`)
    seen.add(id)
    const match = asRecord(item.match)
    const ports = Array.isArray(match.ports)
      ? match.ports.filter((port): port is number => Number.isInteger(port))
      : []
    const services = isStringArray(match.services)
      ? match.services.map((service) => service.toLowerCase())
      : []
    const patterns = isStringArray(match.versions) ? match.versions : []
    const versions: RegExp[] = []
    for (const pattern of patterns) {
      try {
        versions.push(new RegExp(pattern, 'i'))
      } catch {
        return errors.push(`${where}: invalid version pattern "${pattern}"`)
      }
    }
    if (ports.length + services.length + versions.length === 0) {
      return errors.push(`${where}: "match" needs at least one of ports, services or versions`)
    }
    const suggestions = isStringArray(item.suggest) ? item.suggest : []
    if (suggestions.length === 0) return errors.push(`${where}: "suggest" needs at least one page`)
    rules.push({
      id,
      title: typeof item.title === 'string' && item.title.trim() ? item.title.trim() : id,
      ports,
      services,
      versions,
      suggest: suggestions,
      note: typeof item.note === 'string' ? item.note.trim() : '',
    })
  })
  return { rules, errors }
}

function matches(rule: Rule, port: ScannedPort): boolean {
  const service = port.service.toLowerCase()
  return (
    rule.ports.includes(port.port) ||
    rule.services.some((name) => service.includes(name)) ||
    rule.versions.some((pattern) => pattern.test(port.version))
  )
}

/** Matches open ports against the rules, ordered by the lowest matching port. */
export function suggest(ports: ScannedPort[], rules: Rule[]): Suggestion[] {
  const open = [...ports].filter((port) => port.state.startsWith('open')).sort((a, b) => a.port - b.port)
  return rules
    .map((rule, order) => ({ rule, order, ports: open.filter((port) => matches(rule, port)) }))
    .filter((result) => result.ports.length > 0)
    .sort((a, b) => a.ports[0]!.port - b.ports[0]!.port || a.order - b.order)
    .map(({ rule, ports: matched }) => ({ rule, ports: matched }))
}

export function validateRules(rules: Rule[], content: Content): string[] {
  return rules.flatMap((rule) =>
    rule.suggest.flatMap((ref) => {
      const problem = refProblem(ref, content)
      return problem ? [`Rule ${rule.id}: ${problem}`] : []
    }),
  )
}
