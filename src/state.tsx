import { createContext, useCallback, useContext, useMemo, type ReactNode } from 'react'
import type { ScannedHost } from './lib/nmap'
import { isBooleanRecord, isStringArray, type Guard } from './lib/guards'
import { usePersistentState } from './lib/storage'
import { effectiveVariables, isTargets, newTarget, upsertFromScan, type Target } from './lib/targets'
import { isVariables, type Variables } from './lib/variables'

const MAX_RECENTS = 8
const isNullableString: Guard<string | null> = (value): value is string | null =>
  value === null || typeof value === 'string'

interface AppState {
  /** Values filled into commands: globals layered under the active target. */
  variables: Variables
  globals: Variables
  setVariable: (name: string, value: string) => void
  removeVariable: (name: string) => void
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
 * The cheatsheet's personal state: global variables, targets, checklist
 * progress, pinned and recent pages. One provider keeps every code block and
 * sidebar in step within a tab; storage events keep separate tabs in step.
 */
export function AppStateProvider({ children }: { children: ReactNode }) {
  const [globals, setGlobals] = usePersistentState('variables', isVariables, {})
  const [targets, setTargets] = usePersistentState('targets', isTargets, [])
  const [activeId, setActiveId] = usePersistentState('active-target', isNullableString, null)
  const [checks, setChecks] = usePersistentState('checks', isBooleanRecord, {})
  const [pins, setPins] = usePersistentState('pins', isStringArray, [])
  const [recents, setRecents] = usePersistentState('recents', isStringArray, [])

  const activeTarget = useMemo(() => targets.find((target) => target.id === activeId), [targets, activeId])
  const variables = useMemo(() => effectiveVariables(globals, activeTarget), [globals, activeTarget])

  const setVariable = useCallback(
    (name: string, value: string) => setGlobals((prev) => ({ ...prev, [name]: value })),
    [setGlobals],
  )
  const removeVariable = useCallback(
    (name: string) =>
      setGlobals((prev) => Object.fromEntries(Object.entries(prev).filter(([key]) => key !== name))),
    [setGlobals],
  )
  const setActiveTarget = useCallback((id: string | null) => setActiveId(id), [setActiveId])
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
      setActiveId((prev) => (prev === id ? null : prev))
    },
    [setTargets, setActiveId],
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
      globals,
      setVariable,
      removeVariable,
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
      globals,
      setVariable,
      removeVariable,
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
