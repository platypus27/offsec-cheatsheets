import { useEffect, useMemo, useRef, useState } from 'react'
import { Check, Copy } from 'lucide-react'
import { IconButton, toast } from '@kryv/teal'
import { fillVariables, highlightMasked, resolveLanguage } from '../lib/highlight'
import { substitute } from '../lib/variables'
import { useAppState } from '../state'

interface CodeBlockProps {
  code: string
  language?: string
  accessibleLabel?: string
}

const trimNewlines = (code: string) => code.replace(/^\n+|\n+$/g, '')

/**
 * Highlighted, copyable command block. Teal's CodeBlock has no highlighting
 * and reports "Copied" even when the clipboard write fails, which during an
 * exam means pasting a stale command; this one fills in target variables
 * and says so loudly when a copy fails.
 */
export function CodeBlock({ code, language, accessibleLabel }: CodeBlockProps) {
  const { variables } = useAppState()
  const [copied, setCopied] = useState(false)
  const timer = useRef<number | undefined>(undefined)
  const source = trimNewlines(code)
  const label = language || 'text'
  const highlighted = useMemo(() => highlightMasked(source, language), [source, language])
  const html = useMemo(() => fillVariables(highlighted, variables), [highlighted, variables])

  useEffect(() => () => window.clearTimeout(timer.current), [])

  async function copy() {
    try {
      await navigator.clipboard.writeText(substitute(source, variables))
      setCopied(true)
      window.clearTimeout(timer.current)
      timer.current = window.setTimeout(() => setCopied(false), 1500)
      toast({ title: 'Copied to clipboard', variant: 'success', duration: 1500 })
    } catch {
      toast({ title: 'Could not copy - select the text and copy manually', variant: 'danger' })
    }
  }

  return (
    <div className="code-block group my-4 overflow-hidden rounded-xl border border-teal-outline-variant/40 bg-teal-surface-container-low">
      <div className="flex items-center justify-between border-b border-teal-outline-variant/30 py-1 pl-4 pr-1.5">
        <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-teal-on-surface-variant">
          {label}
        </span>
        <IconButton label={copied ? 'Copied' : 'Copy code'} size="sm" variant="ghost" onClick={copy}>
          {copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
        </IconButton>
      </div>
      <pre
        role="region"
        aria-label={accessibleLabel || `${label} code`}
        tabIndex={0}
        className={`prism-code language-${resolveLanguage(language) || 'text'} overflow-x-auto px-4 py-3 text-[13px] leading-relaxed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-teal-primary`}
      >
        <code dangerouslySetInnerHTML={{ __html: html }} />
      </pre>
    </div>
  )
}
