import { act, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { isStringArray } from './guards'
import { readJSON, usePersistentState, writeJSON } from './storage'

afterEach(() => vi.restoreAllMocks())

describe('readJSON / writeJSON', () => {
  it('round-trips values under the app namespace', () => {
    expect(writeJSON('pins', ['a'])).toBe(true)
    expect(window.localStorage.getItem('offsec-cheatsheets:pins')).toBe('["a"]')
    expect(readJSON('pins', isStringArray, [])).toEqual(['a'])
  })

  it('falls back when stored data is corrupt or the wrong shape', () => {
    window.localStorage.setItem('offsec-cheatsheets:pins', '{not json')
    expect(readJSON('pins', isStringArray, ['fallback'])).toEqual(['fallback'])
    window.localStorage.setItem('offsec-cheatsheets:pins', '{"a":1}')
    expect(readJSON('pins', isStringArray, [])).toEqual([])
  })

  it('survives storage that throws', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('denied')
    })
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('quota')
    })
    expect(readJSON('pins', isStringArray, [])).toEqual([])
    expect(writeJSON('pins', ['a'])).toBe(false)
  })
})

describe('usePersistentState', () => {
  it('persists updates and picks up changes from other tabs', () => {
    const { result } = renderHook(() => usePersistentState('pins', isStringArray, [] as string[]))
    act(() => result.current[1](['x']))
    expect(result.current[0]).toEqual(['x'])
    expect(readJSON('pins', isStringArray, [])).toEqual(['x'])

    act(() => {
      window.localStorage.setItem('offsec-cheatsheets:pins', '["from-other-tab"]')
      window.dispatchEvent(new StorageEvent('storage', { key: 'offsec-cheatsheets:pins' }))
    })
    expect(result.current[0]).toEqual(['from-other-tab'])
  })

  it('accepts updater functions', () => {
    const { result } = renderHook(() => usePersistentState('pins', isStringArray, ['a']))
    act(() => result.current[1]((prev) => [...prev, 'b']))
    expect(result.current[0]).toEqual(['a', 'b'])
  })
})
