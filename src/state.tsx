import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import {
  emptyCompanionSession,
  emptyCompanionSessions,
  isCompanionSessions,
  type CompanionSession,
  type CompanionSessions,
} from './lib/companions'
import { isBooleanRecord, isStringArray, type Guard } from './lib/guards'
import { createId } from './lib/ids'
import type { ScannedHost } from './lib/nmap'
import {
  initialProfiles,
  isStoredVariableProfiles,
  isVariableProfiles,
  migrateProfiles,
  migrateProfileTargets,
  nextBoxName,
  type VariableProfile,
} from './lib/profiles'
import { readJSON, usePersistentState } from './lib/storage'
import { isTargets, mergePorts } from './lib/targets'
import { isVariables, type Variables } from './lib/variables'

const MAX_RECENTS = 8
const isNullableString: Guard<string | null> = (value): value is string | null =>
  value === null || typeof value === 'string'

interface AppState {
  variables: Variables
  profiles: VariableProfile[]
  sharedVariables: Variables
  setSharedVariable: (name: string, value: string) => void
  defaultProfile: VariableProfile
  setDefaultProfile: (id: string) => void
  addBox: () => string
  updateProfile: (id: string, patch: Partial<Pick<VariableProfile, 'name' | 'variables' | 'ports'>>) => void
  setVariable: (name: string, value: string) => void
  importHost: (host: ScannedHost) => void
  checks: Record<string, boolean>
  setCheck: (key: string, checked: boolean) => void
  resetChecks: (prefix: string) => void
  companionSessions: CompanionSessions
  updateCompanionSession: (
    key: string,
    start: string,
    update: (session: CompanionSession) => CompanionSession,
  ) => void
  resetCompanionSession: (key: string) => void
  pins: string[]
  togglePin: (slug: string) => void
  recents: string[]
  addRecent: (slug: string) => void
}

const AppStateContext = createContext<AppState | null>(null)

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [initial] = useState(() => {
    const legacyTargets = readJSON('targets', isTargets, [])
    const stored = readJSON('variable-profiles', isStoredVariableProfiles, null)
    if (stored?.version === 3) return stored
    if (stored?.version === 2) return migrateProfileTargets(stored, legacyTargets)
    if (stored?.version === 1) return migrateProfiles(stored, legacyTargets)
    return initialProfiles(
      readJSON('variables', isVariables, {}),
      readJSON('active-target', isNullableString, null),
      legacyTargets,
    )
  })
  const [profileState, setProfileState] = usePersistentState('variable-profiles', isVariableProfiles, initial)
  const profiles = profileState.items
  const defaultProfile = profiles.find((profile) => profile.id === profileState.defaultId)!
  const [checks, setChecks] = usePersistentState('checks', isBooleanRecord, {})
  const [companionSessions, setCompanionSessions] = usePersistentState(
    'companion-sessions',
    isCompanionSessions,
    emptyCompanionSessions(),
  )
  const [pins, setPins] = usePersistentState('pins', isStringArray, [])
  const [recents, setRecents] = usePersistentState('recents', isStringArray, [])

  const variables = useMemo(() => {
    const resolved = { ...profileState.shared, ...defaultProfile.variables }
    const dc = profiles.find((profile) => profile.id === 'dc01')?.variables.RHOST?.trim()
    if (dc) resolved.DC = dc
    else delete resolved.DC
    return resolved
  }, [defaultProfile, profiles, profileState.shared])

  const updateProfile = useCallback(
    (id: string, patch: Partial<Pick<VariableProfile, 'name' | 'variables' | 'ports'>>) =>
      setProfileState((prev) => ({
        ...prev,
        items: prev.items.map((profile) => (profile.id === id ? { ...profile, ...patch } : profile)),
      })),
    [setProfileState],
  )
  const setSharedVariable = useCallback(
    (name: string, value: string) =>
      setProfileState((prev) => ({ ...prev, shared: { ...prev.shared, [name]: value } })),
    [setProfileState],
  )
  const setDefaultProfile = useCallback(
    (id: string) =>
      setProfileState((prev) =>
        prev.items.some((profile) => profile.id === id) ? { ...prev, defaultId: id } : prev,
      ),
    [setProfileState],
  )
  const addBox = useCallback(() => {
    const id = createId('box')
    setProfileState((prev) => ({
      ...prev,
      items: [...prev.items, { id, name: nextBoxName(prev.items), variables: {}, ports: [] }],
    }))
    return id
  }, [setProfileState])
  const setVariable = useCallback(
    (name: string, value: string) =>
      setProfileState((prev) => ({
        ...prev,
        items: prev.items.map((profile) =>
          profile.id === prev.defaultId
            ? { ...profile, variables: { ...profile.variables, [name]: value } }
            : profile,
        ),
      })),
    [setProfileState],
  )
  const importHost = useCallback(
    (host: ScannedHost) => {
      const address = host.address.trim()
      if (!address) return
      setProfileState((prev) => ({
        ...prev,
        items: prev.items.map((profile) =>
          profile.id === prev.defaultId
            ? {
                ...profile,
                variables: { ...profile.variables, RHOST: address },
                ports: mergePorts(profile.ports, host.ports),
              }
            : profile,
        ),
      }))
    },
    [setProfileState],
  )
  const setCheck = useCallback(
    (key: string, checked: boolean) => setChecks((prev) => ({ ...prev, [key]: checked })),
    [setChecks],
  )
  const resetChecks = useCallback(
    (prefix: string) =>
      setChecks((prev) =>
        Object.fromEntries(Object.entries(prev).filter(([key]) => !key.startsWith(prefix))),
      ),
    [setChecks],
  )
  const updateCompanionSession = useCallback(
    (key: string, start: string, update: (session: CompanionSession) => CompanionSession) =>
      setCompanionSessions((prev) => {
        const current = prev.items[key] ?? emptyCompanionSession(start)
        return { ...prev, items: { ...prev.items, [key]: update(current) } }
      }),
    [setCompanionSessions],
  )
  const resetCompanionSession = useCallback(
    (key: string) =>
      setCompanionSessions((prev) => ({
        ...prev,
        items: Object.fromEntries(Object.entries(prev.items).filter(([itemKey]) => itemKey !== key)),
      })),
    [setCompanionSessions],
  )
  const togglePin = useCallback(
    (slug: string) =>
      setPins((prev) => (prev.includes(slug) ? prev.filter((pin) => pin !== slug) : [...prev, slug])),
    [setPins],
  )
  const addRecent = useCallback(
    (slug: string) =>
      setRecents((prev) => [slug, ...prev.filter((item) => item !== slug)].slice(0, MAX_RECENTS)),
    [setRecents],
  )

  const value = useMemo(
    () => ({
      variables,
      profiles,
      sharedVariables: profileState.shared,
      setSharedVariable,
      defaultProfile,
      setDefaultProfile,
      addBox,
      updateProfile,
      setVariable,
      importHost,
      checks,
      setCheck,
      resetChecks,
      companionSessions,
      updateCompanionSession,
      resetCompanionSession,
      pins,
      togglePin,
      recents,
      addRecent,
    }),
    [
      variables,
      profiles,
      profileState.shared,
      setSharedVariable,
      defaultProfile,
      setDefaultProfile,
      addBox,
      updateProfile,
      setVariable,
      importHost,
      checks,
      setCheck,
      resetChecks,
      companionSessions,
      updateCompanionSession,
      resetCompanionSession,
      pins,
      togglePin,
      recents,
      addRecent,
    ],
  )
  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>
}

export function useAppState(): AppState {
  const state = useContext(AppStateContext)
  if (!state) throw new Error('useAppState must be used within an AppStateProvider')
  return state
}
