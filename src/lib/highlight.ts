import Prism from 'prismjs'
import 'prismjs/components/prism-bash'
import 'prismjs/components/prism-powershell'
import 'prismjs/components/prism-batch'
import 'prismjs/components/prism-python'
import 'prismjs/components/prism-sql'
import 'prismjs/components/prism-http'
import 'prismjs/components/prism-json'
import 'prismjs/components/prism-yaml'
import 'prismjs/components/prism-markup-templating'
import 'prismjs/components/prism-php'
import 'prismjs/components/prism-c'
import 'prismjs/components/prism-csharp'
import 'prismjs/components/prism-ini'
import { replacePlaceholders, resolvePlaceholder, type Placeholder, type Variables } from './variables'

const ALIASES: Record<string, string> = {
  sh: 'bash',
  shell: 'bash',
  zsh: 'bash',
  console: 'bash',
  ps: 'powershell',
  ps1: 'powershell',
  pwsh: 'powershell',
  cmd: 'batch',
  bat: 'batch',
  py: 'python',
  html: 'markup',
  xml: 'markup',
  js: 'javascript',
  cs: 'csharp',
  yml: 'yaml',
}

export function resolveLanguage(language: string | undefined): string {
  const name = (language ?? '').toLowerCase()
  return ALIASES[name] ?? name
}

export function escapeHtml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

const sentinel = (index: number) => `QXPH${index}QX`
const SENTINEL = /QXPH(\d+)QX/g

export interface MaskedHighlight {
  html: string
  placeholders: Placeholder[]
}

/**
 * Highlights code once, with every `{{NAME}}` placeholder swapped for an
 * opaque identifier sentinel first so no grammar can split it across tokens.
 * The result depends only on the code, so it is computed once per block.
 */
export function highlightMasked(code: string, language: string | undefined): MaskedHighlight {
  const placeholders: Placeholder[] = []
  const masked = replacePlaceholders(code, (placeholder) => sentinel(placeholders.push(placeholder) - 1))
  const lang = resolveLanguage(language)
  const grammar = Prism.languages[lang]
  return { html: grammar ? Prism.highlight(masked, grammar, lang) : escapeHtml(masked), placeholders }
}

/** Cheap per-keystroke step: fills sentinels with `.var-set` values or `.var-unset` prompts. */
export function fillVariables({ html, placeholders }: MaskedHighlight, variables: Variables): string {
  return html.replace(SENTINEL, (match, index: string) => {
    const placeholder = placeholders[Number(index)]
    if (!placeholder) return match
    const { name, source } = placeholder
    const value = resolvePlaceholder(placeholder, variables)
    return value === undefined
      ? `<span class="var-unset" title="Set ${name} in Variables">${escapeHtml(source)}</span>`
      : `<span class="var-set" title="${name}">${escapeHtml(value)}</span>`
  })
}
