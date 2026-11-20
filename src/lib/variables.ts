import { isRecord } from './guards'

export type Variables = Record<string, string>

const PLACEHOLDER = /\{\{\s*([A-Z][A-Z0-9_]*)(?:\s*\|\s*(sh))?\s*\}\}/g

export interface Placeholder {
  name: string
  source: string
  shellQuoted: boolean
}

export function replacePlaceholders(code: string, replace: (placeholder: Placeholder) => string): string {
  return code.replace(PLACEHOLDER, (source, name: string, format?: string) =>
    replace({ name, source, shellQuoted: format === 'sh' }),
  )
}

/** Resolve the authored format, preserving exact values for quoted arguments. */
export function resolvePlaceholder(
  { name, shellQuoted }: Placeholder,
  variables: Variables,
): string | undefined {
  const value = variables[name]
  if (!shellQuoted) return (name === 'PASS' ? value : value?.trim()) || undefined
  return value ? "'" + value.replaceAll("'", "'\\''") + "'" : undefined
}

/** Substitute entered values, keeping unfilled placeholders visible. */
export function substitute(code: string, variables: Variables): string {
  return replacePlaceholders(
    code,
    (placeholder) => resolvePlaceholder(placeholder, variables) ?? placeholder.source,
  )
}

export function findPlaceholders(code: string): string[] {
  return [...new Set(Array.from(code.matchAll(PLACEHOLDER), (match) => match[1] ?? ''))].filter(Boolean)
}

/** Attacker-side values shared by every box profile; set once, apply everywhere. */
export const SHARED_VARIABLES: { name: string; label: string; hint: string }[] = [
  { name: 'LHOST', label: 'My IP', hint: 'Your Kali address reachable from the box (often tun0)' },
]

export const VARIABLE_NAME = /^[A-Z][A-Z0-9_]*$/

export function isVariables(value: unknown): value is Variables {
  return (
    isRecord(value) &&
    Object.entries(value).every(([key, item]) => VARIABLE_NAME.test(key) && typeof item === 'string')
  )
}
