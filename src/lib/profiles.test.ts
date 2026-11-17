import { describe, expect, it } from 'vitest'
import {
  initialProfiles,
  isVariableProfiles,
  isVariableProfilesV1,
  migrateProfiles,
  migrateProfileTargets,
  nextBoxName,
  type VariableProfilesV1,
  type VariableProfilesV2,
} from './profiles'
import type { Target } from './targets'

const v1: VariableProfilesV1 = {
  version: 1,
  defaultId: 'ad',
  items: [
    {
      id: 'ad',
      name: 'AD',
      targetId: 'target-1',
      variables: {
        MS01: '10.10.139.141',
        MS02: '10.10.139.142',
        DC01: '10.10.139.140',
        LHOST: '192.168.45.152',
        LPORT: '8443',
        DOMAIN: 'oscp.exam',
        USER: 'celia.almeda',
      },
    },
    { id: 'box-1', name: 'Box 1', targetId: null, variables: { RHOST: '172.16.0.10', RPORT: '22' } },
    { id: 'box-2', name: 'Box 2', targetId: null, variables: { LHOST: '', NOTE: 'keep-me' } },
    { id: 'box-3', name: 'Box 3', targetId: null, variables: {} },
  ],
}

const targets: Target[] = [
  {
    id: 'target-1',
    name: 'Legacy host',
    address: '10.10.139.141',
    vars: { DOMAIN: 'target.example' },
    ports: [{ port: 445, protocol: 'tcp', state: 'open', service: 'microsoft-ds', version: '' }],
    notes: 'Legacy note',
  },
  {
    id: 'legacy-target',
    name: 'Box legacy',
    address: '192.0.2.20',
    vars: { RPORT: '8443' },
    ports: [{ port: 22, protocol: 'tcp', state: 'open', service: 'ssh', version: 'Example SSH' }],
    notes: 'Keep this note',
  },
]

describe('initialProfiles', () => {
  it('creates six machine profiles and migrates legacy Box 1 target data', () => {
    const profiles = initialProfiles(
      { RHOST: '192.0.2.10', LHOST: '192.168.45.152', USER: 'legacy-user' },
      'legacy-target',
      targets,
    )
    expect(profiles.version).toBe(3)
    expect(profiles.items.map((item) => item.name)).toEqual([
      'MS01',
      'MS02',
      'DC01',
      'Box 1',
      'Box 2',
      'Box 3',
    ])
    const boxOne = profiles.items.find((item) => item.id === 'box-1')!
    expect(boxOne.variables).toEqual({ RHOST: '192.0.2.20', RPORT: '8443', USER: 'legacy-user' })
    expect(boxOne.ports).toEqual(targets[1]!.ports)
    expect(boxOne).not.toHaveProperty('targetId')
    expect(profiles.shared).toEqual({ LHOST: '192.168.45.152' })
    expect(isVariableProfiles(profiles)).toBe(true)
  })
})

describe('profile migrations', () => {
  it('maps v1 AD values and folds linked target values and ports into each profile', () => {
    const migrated = migrateProfiles(v1, targets)
    expect(migrated.version).toBe(3)
    expect(migrated.defaultId).toBe('ms01')
    const ms01 = migrated.items.find((item) => item.id === 'ms01')!
    expect(ms01.variables).toEqual({
      DOMAIN: 'target.example',
      USER: 'celia.almeda',
      RHOST: '10.10.139.141',
    })
    expect(ms01.ports).toEqual(targets[0]!.ports)
    expect(migrated.items.find((item) => item.id === 'ms02')?.variables).toEqual({ RHOST: '10.10.139.142' })
    expect(migrated.items.find((item) => item.id === 'dc01')?.variables).toEqual({ RHOST: '10.10.139.140' })
    expect(migrated.items.find((item) => item.id === 'box-2')?.variables).toEqual({ NOTE: 'keep-me' })
    expect(migrated.shared).toEqual({ LHOST: '192.168.45.152' })
    expect(migrated.shared).not.toHaveProperty('LPORT')
    expect(isVariableProfiles(migrated)).toBe(true)
  })

  it('migrates v2 target links without losing profile values', () => {
    const v2: VariableProfilesV2 = {
      version: 2,
      defaultId: 'box-1',
      shared: { LHOST: '192.0.2.1' },
      items: [
        { id: 'ms01', name: 'MS01', targetId: null, variables: {} },
        { id: 'ms02', name: 'MS02', targetId: null, variables: {} },
        { id: 'dc01', name: 'DC01', targetId: null, variables: { RHOST: '192.0.2.5' } },
        { id: 'box-1', name: 'Box 1', targetId: 'legacy-target', variables: { RHOST: '192.0.2.10' } },
        { id: 'box-2', name: 'Box 2', targetId: null, variables: {} },
        { id: 'box-3', name: 'Box 3', targetId: null, variables: {} },
      ],
    }
    const migrated = migrateProfileTargets(v2, targets)
    expect(migrated.defaultId).toBe('box-1')
    expect(migrated.items.find((item) => item.id === 'box-1')?.variables).toEqual({
      RHOST: '192.0.2.20',
      RPORT: '8443',
    })
    expect(migrated.items.find((item) => item.id === 'box-1')?.ports).toEqual(targets[1]!.ports)
  })
})

describe('guards', () => {
  it('accepts v1 only through the legacy guard and requires ports in v3', () => {
    expect(isVariableProfilesV1(v1)).toBe(true)
    expect(isVariableProfiles(v1)).toBe(false)
    expect(isVariableProfiles({ ...initialProfiles({}, null), items: [{ id: 'bad' }] })).toBe(false)
  })
})

describe('nextBoxName', () => {
  it('continues after the highest numbered Box tab', () => {
    const profiles = initialProfiles({}, null)
    expect(nextBoxName(profiles.items)).toBe('Box 4')
    expect(nextBoxName([...profiles.items, { id: 'x', name: 'WEB02', variables: {}, ports: [] }])).toBe(
      'Box 4',
    )
  })
})
