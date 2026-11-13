export interface ScannedPort {
  port: number
  protocol: 'tcp' | 'udp' | 'sctp'
  state: string
  service: string
  version: string
}

export interface ScannedHost {
  address: string
  hostname: string | undefined
  ports: ScannedPort[]
}

export interface ScanResult {
  format: 'nmap-normal' | 'nmap-grepable' | 'nmap-xml' | 'unknown'
  hosts: ScannedHost[]
}

const UNKNOWN: ScanResult = { format: 'unknown', hosts: [] }
const PROTOCOLS = new Set(['tcp', 'udp', 'sctp'])
const toProtocol = (value: string) => (PROTOCOLS.has(value) ? (value as ScannedPort['protocol']) : null)

function parseXml(input: string): ScanResult {
  const doc = new DOMParser().parseFromString(input, 'application/xml')
  if (doc.getElementsByTagName('parsererror').length > 0) return UNKNOWN
  const hosts = Array.from(doc.getElementsByTagName('host'), (host): ScannedHost => {
    const address =
      Array.from(host.getElementsByTagName('address')).find((item) => item.getAttribute('addrtype') !== 'mac')?.getAttribute('addr') ?? ''
    const hostname = host.getElementsByTagName('hostname')[0]?.getAttribute('name') ?? undefined
    const ports = Array.from(host.getElementsByTagName('port')).flatMap((port): ScannedPort[] => {
      const protocol = toProtocol(port.getAttribute('protocol') ?? '')
      const portid = port.getAttribute('portid') ?? ''
      // Number('') and Number(null) are 0; a missing id must not become port 0.
      if (!protocol || !/^\d+$/.test(portid)) return []
      const number = Number(portid)
      const service = port.getElementsByTagName('service')[0]
      const extra = service?.getAttribute('extrainfo')
      const version = [service?.getAttribute('product'), service?.getAttribute('version'), extra ? `(${extra})` : '']
        .filter(Boolean)
        .join(' ')
      return [
        {
          port: number,
          protocol,
          state: port.getElementsByTagName('state')[0]?.getAttribute('state') ?? '',
          service: service?.getAttribute('name') ?? '',
          version,
        },
      ]
    })
    return { address, hostname, ports }
  })
  return { format: 'nmap-xml', hosts }
}

function parseGrepable(input: string): ScanResult {
  const byAddress = new Map<string, ScannedHost>()
  for (const line of input.split(/\r?\n/)) {
    const match = /^Host:\s+(\S+)\s+\(([^)]*)\)\s+Ports:\s+(.*?)(?:\t|$)/.exec(line)
    if (!match) continue
    const [, address = '', hostname = '', portList = ''] = match
    const host = byAddress.get(address) ?? { address, hostname: hostname || undefined, ports: [] }
    byAddress.set(address, host)
    for (const entry of portList.split(/,\s*/)) {
      // port/state/protocol/owner/service/rpc_info/version/
      const [port = '', state = '', protocol = '', , service = '', , version = ''] = entry.split('/')
      const proto = toProtocol(protocol)
      if (!proto || !/^\d+$/.test(port)) continue
      host.ports.push({ port: Number(port), protocol: proto, state, service, version: version.trim() })
    }
  }
  return byAddress.size > 0 ? { format: 'nmap-grepable', hosts: [...byAddress.values()] } : UNKNOWN
}

const REPORT = /^Nmap scan report for (?:(\S+) \((\S+)\)|(\S+))\s*$/
const PORT_ROW = /^(\d+)\/(tcp|udp|sctp)\s+(\S+)\s+(\S+)(?:\s+(.*?))?\s*$/

function parseNormal(input: string): ScanResult {
  const hosts: ScannedHost[] = []
  let current: ScannedHost | undefined
  for (const line of input.split(/\r?\n/)) {
    const report = REPORT.exec(line)
    if (report) {
      current = report[3]
        ? { address: report[3], hostname: undefined, ports: [] }
        : { address: report[2] ?? '', hostname: report[1], ports: [] }
      hosts.push(current)
      continue
    }
    const row = PORT_ROW.exec(line)
    if (!row) continue
    if (!current) {
      current = { address: '', hostname: undefined, ports: [] }
      hosts.push(current)
    }
    const [, port = '', protocol = '', state = '', service = '', version = ''] = row
    current.ports.push({ port: Number(port), protocol: toProtocol(protocol) ?? 'tcp', state, service, version })
  }
  return hosts.some((host) => host.ports.length > 0 || host.address) ? { format: 'nmap-normal', hosts } : UNKNOWN
}

/** Parses pasted nmap output (normal, grepable or XML) into hosts and ports. */
export function parseScan(input: string): ScanResult {
  const trimmed = input.trim()
  if (!trimmed) return UNKNOWN
  if (trimmed.startsWith('<')) return parseXml(trimmed)
  if (/^Host:\s.*Ports:/m.test(trimmed)) return parseGrepable(trimmed)
  return parseNormal(trimmed)
}
