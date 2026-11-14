import { parse as parseYaml } from 'yaml'
import type { Content } from './content'
import { isStringList, record, refProblem } from './refs'

export interface PlaybookOption {
  label: string
  next: string
}

export interface PlaybookNode {
  id: string
  prompt: string
  body: string
  links: string[]
  options: PlaybookOption[]
}

export interface Playbook {
  id: string
  title: string
  description: string
  start: string
  nodes: Record<string, PlaybookNode>
}

const NODE_ID = /^[A-Za-z0-9_-]+$/
const text = (value: unknown) => (typeof value === 'string' ? value.trim() : '')

/**
 * Reads a decision-tree playbook: nodes with a prompt, optional body and
 * note links, and options that lead to other nodes. Structural problems are
 * reported and the playbook is withheld so a broken tree never half-renders.
 */
export function parsePlaybook(id: string, source: string): { playbook?: Playbook; errors: string[] } {
  let data: unknown
  try {
    data = parseYaml(source)
  } catch (error) {
    return {
      errors: [
        `Could not read playbook YAML: ${error instanceof Error ? error.message.split('\n')[0] : 'syntax error'}`,
      ],
    }
  }
  const root = record(data)
  const rawNodes = record(root.nodes)
  if (!text(root.title) || !text(root.start) || Object.keys(rawNodes).length === 0) {
    return { errors: ['A playbook needs "title", "start" and "nodes"'] }
  }

  const errors: string[] = []
  // Own keys only: `in` would accept Object.prototype names like "constructor".
  const exists = (nodeId: string) => Object.hasOwn(rawNodes, nodeId)
  const nodes: Record<string, PlaybookNode> = Object.create(null)
  for (const [nodeId, raw] of Object.entries(rawNodes)) {
    // The answered path is stored in the URL joined by ".", so ids must not contain it.
    if (!NODE_ID.test(nodeId)) errors.push(`Node id "${nodeId}" may only use letters, digits, "-" and "_"`)
    const node = record(raw)
    const options: PlaybookOption[] = []
    ;(Array.isArray(node.options) ? node.options : []).forEach((rawOption, index) => {
      const option = record(rawOption)
      const where = `Node ${nodeId}, option ${index + 1}`
      const label = text(option.label)
      const next = text(option.next)
      if (!label) return errors.push(`${where}: needs a label`)
      if (!exists(next)) return errors.push(`${where}: next node "${next}" does not exist`)
      options.push({ label, next })
    })
    nodes[nodeId] = {
      id: nodeId,
      prompt: text(node.prompt) || nodeId,
      body: text(node.body),
      links: isStringList(node.links) ? node.links : [],
      options,
    }
  }

  const start = text(root.start)
  if (!exists(start)) errors.unshift(`Start node "${start}" does not exist`)
  else if (errors.length === 0) {
    const reached = new Set<string>()
    const queue = [start]
    while (queue.length) {
      const next = queue.pop()!
      if (reached.has(next)) continue
      reached.add(next)
      queue.push(...nodes[next]!.options.map((option) => option.next))
    }
    for (const nodeId of Object.keys(nodes)) {
      if (!reached.has(nodeId)) errors.push(`Node ${nodeId} is unreachable from the start node`)
    }
  }

  if (errors.length) return { errors }
  return {
    playbook: {
      id,
      title: text(root.title),
      description: text(root.description),
      start,
      nodes: { ...nodes },
    },
    errors,
  }
}

/** Replays a path of node ids, stopping at the first step that is not a valid transition. */
export function walk(playbook: Playbook, path: string[]): string[] {
  const result = [playbook.start]
  for (const step of path.slice(1)) {
    const last = result[result.length - 1]!
    const current = Object.hasOwn(playbook.nodes, last) ? playbook.nodes[last] : undefined
    if (!current?.options.some((option) => option.next === step)) break
    result.push(step)
  }
  if (path[0] !== undefined && path[0] !== playbook.start) return [playbook.start]
  return result
}

export function validatePlaybookLinks(playbook: Playbook, content: Content): string[] {
  return Object.values(playbook.nodes).flatMap((node) =>
    node.links.flatMap((ref) => {
      const problem = refProblem(ref, content)
      return problem ? [`Playbook ${playbook.id}, node ${node.id}: ${problem}`] : []
    }),
  )
}
