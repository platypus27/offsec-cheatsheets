import { describe, expect, it } from 'vitest'
import source from '../content/_playbooks/active-directory.yaml?raw'
import { parsePlaybook } from './lib/playbooks'

const { playbook, errors } = parsePlaybook('active-directory', source)

describe('Active Directory companion coverage', () => {
  it('starts with intake and covers the recurring AD decision areas', () => {
    expect(errors).toEqual([])
    expect(playbook?.start).toBe('intake')
    expect(Object.keys(playbook?.nodes ?? {})).toEqual(
      expect.arrayContaining([
        'scan',
        'anonymous',
        'services',
        'spray',
        'asrep',
        'kerberoast',
        'coerce',
        'graph',
        'access',
        'host-enum',
        'winpeas',
        'privesc',
        'certificates',
        'delegate',
        'dump',
        'reuse',
        'pivot',
        'proof',
      ]),
    )
  })

  it('offers service-specific paths and keeps WinPEAS optional', () => {
    expect(playbook?.nodes.services?.services.map((service) => service.id)).toEqual(
      expect.arrayContaining(['smb', 'rpc', 'ldap', 'kerberos', 'dns', 'winrm', 'mssql', 'web', 'rdp']),
    )
    expect(playbook?.nodes['host-enum']?.options.some((option) => option.next === 'winpeas')).toBe(true)
    expect(playbook?.nodes.intake?.options.some((option) => option.next === 'scan')).toBe(true)
    expect(playbook?.nodes.intake?.options.some((option) => option.next !== 'scan')).toBe(true)
  })
})
