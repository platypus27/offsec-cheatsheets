import { isRecord, isStringArray } from './guards'

export interface CompanionSession {
  path: string[]
  completed: string[]
  findings: Record<string, string>
}

export interface CompanionSessions {
  version: 1
  items: Record<string, CompanionSession>
}

export const emptyCompanionSessions = (): CompanionSessions => ({ version: 1, items: {} })

export function companionKey(playbookId: string, profileId: string, host: string): string {
  return JSON.stringify([playbookId, profileId, host])
}

export function emptyCompanionSession(start: string): CompanionSession {
  return { path: [start], completed: [], findings: {} }
}

function isSession(value: unknown): value is CompanionSession {
  if (!isRecord(value)) return false
  return (
    isStringArray(value.path) &&
    value.path.length > 0 &&
    isStringArray(value.completed) &&
    isRecord(value.findings) &&
    Object.values(value.findings).every((finding) => typeof finding === 'string')
  )
}

export function isCompanionSessions(value: unknown): value is CompanionSessions {
  return (
    isRecord(value) &&
    value.version === 1 &&
    isRecord(value.items) &&
    Object.values(value.items).every(isSession)
  )
}
