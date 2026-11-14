/** Runtime checks shared by YAML parsers and persisted JSON. No browser or React dependencies. */
export type Guard<T> = (value: unknown) => value is T

export function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

/** Treat non-object YAML values as an empty record so callers can report missing fields. */
export function asRecord(value: unknown): Record<string, unknown> {
  return isRecord(value) ? value : {}
}

export const isStringArray: Guard<string[]> = (value): value is string[] =>
  Array.isArray(value) && value.every((item) => typeof item === 'string')

export const isBooleanRecord: Guard<Record<string, boolean>> = (value): value is Record<string, boolean> =>
  isRecord(value) && Object.values(value).every((item) => typeof item === 'boolean')
