import { isRecord } from './guards'

export type Variables = Record<string, string>

/** The one definition of `{{NAME}}` placeholder syntax; display and copy both go through it. */
export const PLACEHOLDER = /\{\{\s*([A-Z][A-Z0-9_]*)\s*\}\}/g

/** The value a placeholder resolves to, or undefined when unset or blank. */
export function resolveVariable(variables: Variables, name: string): string | undefined {
  return variables[name]?.trim() || undefined
}

/** Swaps `{{NAME}}` placeholders for their set values; unset ones stay visible as a prompt. */
export function substitute(code: string, variables: Variables): string {
  return code.replace(PLACEHOLDER, (match, name: string) => resolveVariable(variables, name) ?? match)
}

export function findPlaceholders(code: string): string[] {
  return [...new Set(Array.from(code.matchAll(PLACEHOLDER), (match) => match[1] ?? ''))].filter(Boolean)
}

/** Attacker-side values shared by every box profile; set once, apply everywhere. */
export const SHARED_VARIABLES: { name: string; label: string; hint: string }[] = [
  { name: 'LHOST', label: 'My IP', hint: 'Your Kali address reachable from the box (often tun0)' },
  { name: 'LPORT', label: 'My port', hint: 'Your listener, HTTP server or tunnel port' },
]

export const VARIABLE_NAME = /^[A-Z][A-Z0-9_]*$/

export function isVariables(value: unknown): value is Variables {
  return (
    isRecord(value) &&
    Object.entries(value).every(([key, item]) => VARIABLE_NAME.test(key) && typeof item === 'string')
  )
}
