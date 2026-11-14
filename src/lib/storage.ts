import { useCallback, useEffect, useState } from 'react'
import type { Guard } from './guards'

const NAMESPACE = 'offsec-cheatsheets:'

// Storage can be missing, full, or blocked (private windows, strict file://
// policies). Every caller gets a sane fallback instead of an exception.
export function readJSON<T>(key: string, guard: Guard<T>, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(NAMESPACE + key)
    if (raw === null) return fallback
    const parsed: unknown = JSON.parse(raw)
    return guard(parsed) ? parsed : fallback
  } catch {
    return fallback
  }
}

export function writeJSON(key: string, value: unknown): boolean {
  try {
    window.localStorage.setItem(NAMESPACE + key, JSON.stringify(value))
    return true
  } catch {
    return false
  }
}

/** React state mirrored to localStorage and kept in sync across open tabs. */
export function usePersistentState<T>(key: string, guard: Guard<T>, fallback: T) {
  const [value, setValue] = useState<T>(() => readJSON(key, guard, fallback))

  useEffect(() => {
    function onStorage(event: StorageEvent) {
      if (event.key === NAMESPACE + key) setValue(readJSON(key, guard, fallback))
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
    // fallback is a default, not a dependency: callers pass fresh literals.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, guard])

  const update = useCallback(
    (next: T | ((prev: T) => T)) => {
      setValue((prev) => {
        const resolved = typeof next === 'function' ? (next as (prev: T) => T)(prev) : next
        writeJSON(key, resolved)
        return resolved
      })
    },
    [key],
  )

  return [value, update] as const
}
