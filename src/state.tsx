import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import type { ScannedHost } from './lib/nmap'
import { isBooleanRecord, isStringArray, type Guard } from './lib/guards'
import { readJSON, usePersistentState } from './lib/storage'
import { initialProfiles, isVariableProfiles, type VariableProfile } from './lib/profiles'
import { effectiveVariables, isTargets, newTarget, upsertFromScan, type Target } from './lib/targets'
import { isVariables, type Variables } from './lib/variables'

const MAX_RECENTS = 8
const isNullableString: Guard<string | null> = (value): value is string | null =>
  value === null || typeof value === 'string'

interface AppState {
  /** Values filled into commands: the default profile layered under its saved target. */
  variables: Variables
  profiles: VariableProfile[]
  defaultProfile: VariableProfile
  setDefaultProfile: (id: string) => void
  updateProfile: (id: string, patch: Partial<Pick<VariableProfile, 'variables' | 'targetId'>>) => void
  setVariable: (name: string, value: string) => void
  targets: Target[]
  activeTarget: Target | undefined
  setActiveTarget: (id: string | null) => void
  addTarget: (name: string, address: string) => string
  updateTarget: (id: string, patch: Partial<Omit<Target, 'id'>>) => void
  removeTarget: (id: string) => void
  importHost: (host: ScannedHost) => string
  checks: Record<string, boolean>
  setCheck: (key: string, checked: boolean) => void
  resetChecks: (prefix: string) => void
  pins: string[]
  togglePin: (slug: string) => void
  recents: string[]
  addRecent: (slug: string) => void
}

const AppStateContext = createContext<AppState | null>(null)

/**
 * The cheatsheet's personal state: variable profiles, targets, checklist
 * progress, pinned and recent pages. One provider keeps every code block and
 * sidebar in step within a tab; storage events keep separate tabs in step.
 */
export function AppStateProvider({ children }: { children: ReactNode }) {
  // Read legacy keys only as the initial fallback. A valid profile workspace always wins.
  const [initial] = useState(() =>
    initialProfiles(
      readJSON('variables', isVariables, {}),
      readJSON('active-target', isNullableString, null),
    ),
  )
  const [profileState, setProfileState] = usePersistentState('variable-profiles', isVariableProfiles, initial)
  const profiles = profileState.items
  // The storage guard guarantees that defaultId names an existing profile.
  const defaultProfile = profiles.find((profile) => profile.id === profileState.defaultId)!
  const [targets, setTargets] = usePersistentState('targets', isTargets, [])
  const [checks, setChecks] = usePersistentState('checks', isBooleanRecord, {})
  const [pins, setPins] = usePersistentState('pins', isStringArray, [])
  const [recents, setRecents] = usePersistentState('recents', isStringArray, [])

  const activeTarget = useMemo(
    () => targets.find((target) => target.id === defaultProfile.targetId),
    [targets, defaultProfile.targetId],
  )
  const variables = useMemo(
    () => effectiveVariables(defaultProfile.variables, activeTarget),
    [defaultProfile.variables, activeTarget],
  )

  const updateProfile = useCallback(
    (id: string, patch: Partial<Pick<VariableProfile, 'variables' | 'targetId'>>) =>
      setProfileState((prev) => ({
        ...prev,
        items: prev.items.map((profile) => (profile.id === id ? { ...profile, ...patch } : profile)),
      })),
    [setProfileState],
  )
  const setDefaultProfile = useCallback(
    (id: string) =>
      setProfileState((prev) =>
        prev.items.some((profile) => profile.id === id) ? { ...prev, defaultId: id } : prev,
      ),
    [setProfileState],
  )

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
  const setActiveTarget = useCallback(
    (id: string | null) => updateProfile(defaultProfile.id, { targetId: id }),
    [updateProfile, defaultProfile.id],
  )
  const addTarget = useCallback(
    (name: string, address: string) => {
      const target = newTarget(name, address)
      setTargets((prev) => [...prev, target])
      return target.id
    },
    [setTargets],
  )
  const updateTarget = useCallback(
    (id: string, patch: Partial<Omit<Target, 'id'>>) =>
      setTargets((prev) => prev.map((target) => (target.id === id ? { ...target, ...patch } : target))),
    [setTargets],
  )
  const removeTarget = useCallback(
    (id: string) => {
      setTargets((prev) => prev.filter((target) => target.id !== id))
      setProfileState((prev) => ({
        ...prev,
        items: prev.items.map((profile) =>
          profile.targetId === id ? { ...profile, targetId: null } : profile,
        ),
      }))
    },
    [setTargets, setProfileState],
  )
  const importHost = useCallback(
    (host: ScannedHost) => {
      // State updaters run lazily, so the id must come from a synchronous
      // computation over the current list, not from inside setTargets.
      const result = upsertFromScan(targets, host)
      setTargets(result.targets)
      return result.targetId
    },
    [targets, setTargets],
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
      defaultProfile,
      setDefaultProfile,
      updateProfile,
      setVariable,
      targets,
      activeTarget,
      setActiveTarget,
      addTarget,
      updateTarget,
      removeTarget,
      importHost,
      checks,
      setCheck,
      resetChecks,
      pins,
      togglePin,
      recents,
      addRecent,
    }),
    [
      variables,
      profiles,
      defaultProfile,
      setDefaultProfile,
      updateProfile,
      setVariable,
      targets,
      activeTarget,
      setActiveTarget,
      addTarget,
      updateTarget,
      removeTarget,
      importHost,
      checks,
      setCheck,
      resetChecks,
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
