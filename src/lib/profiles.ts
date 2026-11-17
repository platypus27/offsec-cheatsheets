import { isRecord } from './guards'
import type { ScannedPort } from './nmap'
import { isPorts, type Target } from './targets'
import { isVariables, type Variables } from './variables'

export interface VariableProfile {
  id: string
  name: string
  variables: Variables
  ports: ScannedPort[]
}

interface LegacyVariableProfile {
  id: string
  name: string
  variables: Variables
  targetId: string | null
}

export interface VariableProfiles {
  version: 3
  defaultId: string
  items: VariableProfile[]
  shared: Variables
}

export interface VariableProfilesV2 {
  version: 2
  defaultId: string
  items: LegacyVariableProfile[]
  shared: Variables
}

export interface VariableProfilesV1 {
  version: 1
  defaultId: string
  items: LegacyVariableProfile[]
}

const STARTER_PROFILES = [
  { id: 'ms01', name: 'MS01' },
  { id: 'ms02', name: 'MS02' },
  { id: 'dc01', name: 'DC01' },
  { id: 'box-1', name: 'Box 1' },
  { id: 'box-2', name: 'Box 2' },
  { id: 'box-3', name: 'Box 3' },
]

const MACHINE_VARIABLES = ['MS01', 'MS02', 'DC01']
const PROMOTED_SHARED_NAMES = ['LHOST']
const RETIRED_SHARED_NAMES = ['LHOST', 'LPORT']

function isProfileItem(value: unknown): value is VariableProfile {
  const profile = value as VariableProfile
  return (
    isRecord(value) &&
    typeof profile.id === 'string' &&
    !!profile.id.trim() &&
    typeof profile.name === 'string' &&
    !!profile.name.trim() &&
    isVariables(profile.variables) &&
    isPorts(profile.ports)
  )
}

function isLegacyProfileItem(value: unknown): value is LegacyVariableProfile {
  const profile = value as LegacyVariableProfile
  return (
    isRecord(value) &&
    typeof profile.id === 'string' &&
    !!profile.id.trim() &&
    typeof profile.name === 'string' &&
    !!profile.name.trim() &&
    isVariables(profile.variables) &&
    (profile.targetId === null || typeof profile.targetId === 'string')
  )
}

function hasStarterIds(items: { id: string }[]): boolean {
  return STARTER_PROFILES.every((starter) => items.some((item) => item.id === starter.id))
}

function hasValidDefault(defaultId: unknown, items: unknown): boolean {
  return (
    typeof defaultId === 'string' &&
    Array.isArray(items) &&
    items.some((item) => isRecord(item) && item.id === defaultId)
  )
}

export function isVariableProfiles(value: unknown): value is VariableProfiles {
  return (
    isRecord(value) &&
    value.version === 3 &&
    Array.isArray(value.items) &&
    value.items.every(isProfileItem) &&
    isVariables(value.shared) &&
    hasStarterIds(value.items) &&
    hasValidDefault(value.defaultId, value.items)
  )
}

export function isVariableProfilesV2(value: unknown): value is VariableProfilesV2 {
  return (
    isRecord(value) &&
    value.version === 2 &&
    Array.isArray(value.items) &&
    value.items.every(isLegacyProfileItem) &&
    isVariables(value.shared) &&
    hasValidDefault(value.defaultId, value.items)
  )
}

export function isVariableProfilesV1(value: unknown): value is VariableProfilesV1 {
  return (
    isRecord(value) &&
    value.version === 1 &&
    Array.isArray(value.items) &&
    value.items.every(isLegacyProfileItem) &&
    hasValidDefault(value.defaultId, value.items)
  )
}

export const isStoredVariableProfiles = (
  value: unknown,
): value is VariableProfiles | VariableProfilesV2 | VariableProfilesV1 =>
  isVariableProfiles(value) || isVariableProfilesV2(value) || isVariableProfilesV1(value)

const stripRetired = (variables: Variables): Variables =>
  Object.fromEntries(
    Object.entries(variables).filter(
      ([key]) => !MACHINE_VARIABLES.includes(key) && !RETIRED_SHARED_NAMES.includes(key),
    ),
  )

function splitRetired(variables: Variables, shared: Variables): Variables {
  for (const name of PROMOTED_SHARED_NAMES) {
    if (!(name in shared) && variables[name]?.trim()) shared[name] = variables[name]!
  }
  return stripRetired(variables)
}

export function migrateProfileTargets(legacy: VariableProfilesV2, targets: Target[]): VariableProfiles {
  return {
    version: 3,
    defaultId: legacy.defaultId,
    shared: legacy.shared,
    items: legacy.items.map((profile) => {
      const target = targets.find((item) => item.id === profile.targetId)
      if (!target) return { id: profile.id, name: profile.name, variables: profile.variables, ports: [] }
      return {
        id: profile.id,
        name: profile.name,
        variables: {
          ...profile.variables,
          ...target.vars,
          ...(target.address ? { RHOST: target.address } : {}),
        },
        ports: target.ports,
      }
    }),
  }
}

export function migrateProfiles(legacy: VariableProfilesV1, targets: Target[] = []): VariableProfiles {
  const byId = new Map(legacy.items.map((profile) => [profile.id, profile]))
  const ad = byId.get('ad')
  const shared: Variables = {}
  const adVariables = splitRetired(ad?.variables ?? {}, shared)
  for (const profile of legacy.items) {
    if (profile.id !== 'ad') splitRetired(profile.variables, shared)
  }
  const machineRhost = (name: string): string => ad?.variables[name]?.trim() ?? ''
  const items: LegacyVariableProfile[] = STARTER_PROFILES.map((starter) => {
    if (starter.id === 'ms01') {
      return {
        id: 'ms01',
        name: 'MS01',
        targetId: ad?.targetId ?? null,
        variables: { ...adVariables, RHOST: machineRhost('MS01') || adVariables.RHOST || '' },
      }
    }
    if (starter.id === 'ms02') {
      return {
        id: 'ms02',
        name: 'MS02',
        targetId: null,
        variables: { RHOST: machineRhost('MS02') },
      }
    }
    if (starter.id === 'dc01') {
      return {
        id: 'dc01',
        name: 'DC01',
        targetId: null,
        variables: { RHOST: machineRhost('DC01') },
      }
    }
    const box = byId.get(starter.id)
    return {
      id: starter.id,
      name: starter.name,
      variables: box ? splitRetired(box.variables, shared) : {},
      targetId: box?.targetId ?? null,
    }
  })
  for (const profile of legacy.items) {
    if (!STARTER_PROFILES.some((starter) => starter.id === profile.id)) {
      items.push({ ...profile, variables: splitRetired(profile.variables, shared) })
    }
  }
  const migratedDefault = legacy.defaultId === 'ad' ? 'ms01' : legacy.defaultId
  return migrateProfileTargets(
    {
      version: 2,
      defaultId: items.some((item) => item.id === migratedDefault) ? migratedDefault : 'box-1',
      items,
      shared,
    },
    targets,
  )
}

export function initialProfiles(
  variables: Variables,
  targetId: string | null,
  targets: Target[] = [],
): VariableProfiles {
  const shared: Variables = {}
  const boxOne = splitRetired(variables, shared)
  return migrateProfileTargets(
    {
      version: 2,
      defaultId: 'box-1',
      items: STARTER_PROFILES.map((profile) => ({
        ...profile,
        variables: profile.id === 'box-1' ? boxOne : {},
        targetId: profile.id === 'box-1' ? targetId : null,
      })),
      shared,
    },
    targets,
  )
}

export function nextBoxName(items: VariableProfile[]): string {
  const highest = items.reduce((max, item) => {
    const match = /^Box (\d+)$/.exec(item.name)
    return match ? Math.max(max, Number(match[1])) : max
  }, 0)
  return `Box ${highest + 1}`
}
