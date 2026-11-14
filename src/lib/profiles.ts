import { isRecord } from './guards'
import { isVariables, type Variables } from './variables'

export interface VariableProfile {
  id: string
  name: string
  variables: Variables
  targetId: string | null
}

/** Values and the default live together so a profile switch is one persisted update. */
export interface VariableProfiles {
  version: 1
  defaultId: string
  items: VariableProfile[]
}

const STARTER_PROFILES = [
  { id: 'ad', name: 'AD' },
  { id: 'box-1', name: 'Box 1' },
  { id: 'box-2', name: 'Box 2' },
  { id: 'box-3', name: 'Box 3' },
]

/** Preserve the pre-profile settings in Box 1; other profiles start independently. */
export function initialProfiles(variables: Variables, targetId: string | null): VariableProfiles {
  return {
    version: 1,
    defaultId: 'box-1',
    items: STARTER_PROFILES.map((profile) => ({
      ...profile,
      variables: profile.id === 'box-1' ? { ...variables } : {},
      targetId: profile.id === 'box-1' ? targetId : null,
    })),
  }
}

export function isVariableProfiles(value: unknown): value is VariableProfiles {
  if (
    !isRecord(value) ||
    value.version !== 1 ||
    typeof value.defaultId !== 'string' ||
    !Array.isArray(value.items)
  )
    return false
  const ids = new Set<string>()
  for (const profile of value.items) {
    if (
      !isRecord(profile) ||
      typeof profile.id !== 'string' ||
      !profile.id.trim() ||
      ids.has(profile.id) ||
      typeof profile.name !== 'string' ||
      !profile.name.trim() ||
      !isVariables(profile.variables) ||
      !(profile.targetId === null || typeof profile.targetId === 'string')
    )
      return false
    ids.add(profile.id)
  }
  return ids.has(value.defaultId) && STARTER_PROFILES.every((profile) => ids.has(profile.id))
}
