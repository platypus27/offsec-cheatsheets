import { describe, expect, it } from 'vitest'
import { companionKey, emptyCompanionSession, isCompanionSessions } from './companions'

describe('companion sessions', () => {
  it('uses a stable profile and host-specific key', () => {
    expect(companionKey('active-directory', 'ms01', '10.0.0.1')).toBe(
      '["active-directory","ms01","10.0.0.1"]',
    )
    expect(companionKey('active-directory', 'ms01', '10.0.0.2')).not.toBe(
      companionKey('active-directory', 'ms01', '10.0.0.1'),
    )
  })

  it('creates a clean session at the start node', () => {
    expect(emptyCompanionSession('scan')).toEqual({ path: ['scan'], completed: [], findings: {} })
  })

  it('accepts valid versioned sessions and rejects malformed data', () => {
    const value = {
      version: 1,
      items: {
        ad: { path: ['scan', 'services'], completed: ['scan'], findings: { scan: '445 open' } },
      },
    }
    expect(isCompanionSessions(value)).toBe(true)
    expect(isCompanionSessions({ ...value, version: 2 })).toBe(false)
    expect(
      isCompanionSessions({ version: 1, items: { ad: { path: [], completed: [], findings: {} } } }),
    ).toBe(false)
    expect(
      isCompanionSessions({ version: 1, items: { ad: { path: ['scan'], completed: [1], findings: {} } } }),
    ).toBe(false)
  })
})
