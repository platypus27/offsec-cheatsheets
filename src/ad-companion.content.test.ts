import { describe, expect, it } from 'vitest'
import source from '../content/_playbooks/active-directory.yaml?raw'
import { parsePlaybook } from './lib/playbooks'

const { playbook, errors } = parsePlaybook('active-directory', source)

describe('Active Directory companion coverage', () => {
  it('starts with intake and covers outcome-based AD decision areas', () => {
    expect(errors).toEqual([])
    expect(playbook?.start).toBe('intake')
    expect(Object.keys(playbook?.nodes ?? {})).toEqual(
      expect.arrayContaining([
        'scan',
        'anonymous',
        'services',
        'credential-attacks',
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

  it('uses consolidated enumeration, access, dumping, and pivot command groups', () => {
    const commandRefs = [
      ...Object.values(playbook!.nodes).flatMap((node) => node.commands),
      ...Object.values(playbook!.nodes).flatMap((node) =>
        node.services.flatMap((service) => service.commands),
      ),
    ]
    expect(commandRefs).toEqual(
      expect.arrayContaining([
        'active-directory/ad-enumeration#identify-domain-and-dc',
        'active-directory/ad-enumeration#enumerate-accounts-without-credentials',
        'active-directory/ad-enumeration#enumerate-accounts-with-credentials',
        'active-directory/ad-enumeration#enumerate-groups-and-members',
        'active-directory/ad-enumeration#password-policy-and-kerberos-controls',
        'active-directory/ad-enumeration#bloodhound-ce-collection',
        'services/remote-access#winrm-checks-and-shell',
        'services/remote-access#winrm-hash-and-certificate-authentication',
        'active-directory/credential-access#remote-execution',
        'active-directory/credential-dumping#secretsdump-cheat-sheet',
        'windows/credential-harvesting#first-pass-credential-hunt',
        'windows/windows-privesc#privilege-escalation-decision',
        'pivoting/tunnelling#static-route',
      ]),
    )
  })

  it('keeps service evidence and optional WinPEAS branches without making LDAP the only account source', () => {
    expect(playbook?.nodes.services?.services.map((service) => service.id)).toEqual(
      expect.arrayContaining(['smb', 'rpc', 'ldap', 'kerberos', 'dns', 'winrm', 'mssql', 'web', 'rdp']),
    )
    expect(playbook?.nodes['host-enum']?.options.some((option) => option.next === 'winpeas')).toBe(true)
    expect(playbook?.nodes.anonymous?.commands).toContain(
      'active-directory/ad-enumeration#enumerate-accounts-without-credentials',
    )
    expect(playbook?.nodes.services?.services.find((service) => service.id === 'ldap')?.commands).toContain(
      'active-directory/ad-enumeration#enumerate-groups-and-members',
    )
  })
})
