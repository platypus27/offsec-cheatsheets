import type { ScannedHost, ScannedPort } from './nmap'
import { isVariables, type Variables } from './variables'

export interface Target {
  id: string
  name: string
  address: string
  vars: Variables
  ports: ScannedPort[]
  notes: string
}

let counter = 0
function createId(): string {
  counter += 1
  const random = typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID().slice(0, 8) : Math.random().toString(36).slice(2, 10)
  return `t-${Date.now().toString(36)}-${counter}-${random}`
}

export function newTarget(name: string, address: string): Target {
  return { id: createId(), name: name.trim() || address.trim() || 'Target', address: address.trim(), vars: {}, ports: [], notes: '' }
}

/** Values commands are filled with: globals, overridden by the active target's own vars, with its address as RHOST. */
export function effectiveVariables(globals: Variables, target: Target | undefined): Variables {
  if (!target) return globals
  const merged: Variables = { ...globals, ...target.vars }
  if (target.address) merged.RHOST = target.address
  else if (globals.RHOST !== undefined) merged.RHOST = globals.RHOST
  else delete merged.RHOST
  return merged
}

const portKey = (port: ScannedPort) => `${port.port}/${port.protocol}`

/** Unions two port lists; incoming detail wins, but blanks never erase known service or version data. */
export function mergePorts(existing: ScannedPort[], incoming: ScannedPort[]): ScannedPort[] {
  const merged = new Map(existing.map((port) => [portKey(port), port]))
  for (const port of incoming) {
    const known = merged.get(portKey(port))
    merged.set(
      portKey(port),
      known
        ? { ...port, service: port.service || known.service, version: port.version || known.version }
        : port,
    )
  }
  return [...merged.values()].sort((a, b) => a.port - b.port || a.protocol.localeCompare(b.protocol))
}

export function upsertFromScan(targets: Target[], host: ScannedHost): { targets: Target[]; targetId: string } {
  const index = host.address ? targets.findIndex((target) => target.address === host.address) : -1
  if (index >= 0) {
    const target = targets[index]!
    const updated = { ...target, ports: mergePorts(target.ports, host.ports) }
    return { targets: targets.map((item, position) => (position === index ? updated : item)), targetId: target.id }
  }
  const created = { ...newTarget(host.hostname ?? host.address, host.address), ports: mergePorts([], host.ports) }
  return { targets: [...targets, created], targetId: created.id }
}

const isPort = (value: unknown): value is ScannedPort => {
  const port = value as ScannedPort
  return (
    !!port &&
    typeof port === 'object' &&
    Number.isInteger(port.port) &&
    ['tcp', 'udp', 'sctp'].includes(port.protocol) &&
    typeof port.state === 'string' &&
    typeof port.service === 'string' &&
    typeof port.version === 'string'
  )
}

export function isTargets(value: unknown): value is Target[] {
  return (
    Array.isArray(value) &&
    value.every((item) => {
      const target = item as Target
      return (
        !!target &&
        typeof target === 'object' &&
        typeof target.id === 'string' &&
        typeof target.name === 'string' &&
        typeof target.address === 'string' &&
        typeof target.notes === 'string' &&
        isVariables(target.vars) &&
        Array.isArray(target.ports) &&
        target.ports.every(isPort)
      )
    })
  )
}
