import { describe, expect, it } from 'vitest'
import { effectiveVariables, isTargets, mergePorts, newTarget, upsertFromScan } from './targets'
import type { ScannedPort } from './nmap'

const p = (port: number, service = 'x', version = '', state = 'open'): ScannedPort => ({ port, protocol: 'tcp', state, service, version })

describe('targets', () => {
  it('creates targets with unique ids and trimmed fields', () => {
    const a = newTarget(' web01 ', ' 10.0.0.1 ')
    const b = newTarget('web01', '10.0.0.1')
    expect(a).toMatchObject({ name: 'web01', address: '10.0.0.1', vars: {}, ports: [], notes: '' })
    expect(a.id).not.toBe(b.id)
  })

  it('layers globals, then target vars, then the target address as RHOST', () => {
    const target = { ...newTarget('dc', '10.0.0.9'), vars: { USER: 'svc', RHOST: 'ignored' } }
    expect(effectiveVariables({ LHOST: '10.8.0.2', USER: 'guest' }, target)).toEqual({
      LHOST: '10.8.0.2',
      USER: 'svc',
      RHOST: '10.0.0.9',
    })
    expect(effectiveVariables({ RHOST: 'manual' }, undefined)).toEqual({ RHOST: 'manual' })
    expect(effectiveVariables({ RHOST: 'manual' }, newTarget('no-ip', ''))).toEqual({ RHOST: 'manual' })
  })

  it('merges ports by number and protocol, letting newer scan detail win', () => {
    const merged = mergePorts([p(22, 'ssh', 'OpenSSH 8'), p(80, 'http')], [p(80, 'http', 'Apache 2.4'), p(445, 'smb'), { ...p(22), protocol: 'udp' }])
    expect(merged.map((port) => `${port.port}/${port.protocol}:${port.version}`)).toEqual([
      '22/tcp:OpenSSH 8',
      '22/udp:',
      '80/tcp:Apache 2.4',
      '445/tcp:',
    ])
    // a quick rescan without -sV must not erase known versions
    expect(mergePorts([p(80, 'http', 'Apache 2.4')], [p(80, 'http', '')])[0]!.version).toBe('Apache 2.4')
  })

  it('upserts scanned hosts by address', () => {
    const existing = [{ ...newTarget('web', '10.0.0.1'), ports: [p(22)] }]
    const { targets, targetId } = upsertFromScan(existing, { address: '10.0.0.1', hostname: 'web.lab', ports: [p(80)] })
    expect(targets).toHaveLength(1)
    expect(targetId).toBe(existing[0]!.id)
    expect(targets[0]!.ports.map((port) => port.port)).toEqual([22, 80])

    const added = upsertFromScan(existing, { address: '10.0.0.2', hostname: 'db.lab', ports: [p(3306)] })
    expect(added.targets).toHaveLength(2)
    expect(added.targets[1]).toMatchObject({ name: 'db.lab', address: '10.0.0.2' })
  })

  it('validates stored targets', () => {
    expect(isTargets([newTarget('a', 'b')])).toBe(true)
    expect(isTargets([{ id: 'x' }])).toBe(false)
    expect(isTargets('nope')).toBe(false)
  })
})
