import { useMemo, useState } from 'react'
import { ArrowUp, Copy } from 'lucide-react'
import { Alert, Button, TextArea, toast } from '@kryv/teal'
import { ENCODERS, runEncoder } from '../../lib/encoders'
import { usePersistentState } from '../../lib/storage'
import { ToolLayout } from './ToolLayout'

const isEncoderId = (value: unknown): value is string => typeof value === 'string' && ENCODERS.some((item) => item.id === value)
const GROUPS = [...new Set(ENCODERS.map((encoder) => encoder.group))]

export function EncodersPage() {
  const [input, setInput] = useState('')
  const [encoderId, setEncoderId] = usePersistentState('encoder', isEncoderId, 'base64-encode')
  const result = useMemo(() => runEncoder(encoderId, input), [encoderId, input])
  const output = result.ok ? result.value : ''

  async function copy() {
    try {
      await navigator.clipboard.writeText(output)
      toast({ title: 'Copied to clipboard', variant: 'success', duration: 1500 })
    } catch {
      toast({ title: 'Could not copy - select the text and copy manually', variant: 'danger' })
    }
  }

  return (
    <ToolLayout title="Encoders" description="Convert text offline. Nothing leaves this page.">
      <fieldset className="mb-6">
        <legend className="mb-3 text-sm font-semibold">Conversion</legend>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {GROUPS.map((group) => (
            <div key={group} role="group" aria-label={group}>
              <span aria-hidden="true" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-teal-on-surface-variant">
                {group}
              </span>
              <div className="flex flex-wrap gap-2">
              {ENCODERS.filter((encoder) => encoder.group === group).map((encoder) => (
                <Button
                  key={encoder.id}
                  size="sm"
                  variant={encoder.id === encoderId ? 'primary' : 'secondary'}
                  aria-pressed={encoder.id === encoderId}
                  onClick={() => setEncoderId(encoder.id)}
                >
                  {encoder.label}
                </Button>
              ))}
              </div>
            </div>
          ))}
        </div>
      </fieldset>
      <div className="grid gap-6 lg:grid-cols-2">
        <TextArea
          label="Input"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          spellCheck={false}
          className="min-h-48 font-mono text-sm"
        />
        <div className="flex flex-col gap-2">
          <TextArea label="Output" value={output} readOnly spellCheck={false} className="min-h-48 font-mono text-sm" />
          {!result.ok && input ? <Alert variant="danger" title={result.error} /> : null}
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" size="sm" onClick={copy} disabled={!output}>
              <Copy aria-hidden="true" className="size-3.5" />
              Copy output
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setInput(output)} disabled={!output}>
              <ArrowUp aria-hidden="true" className="size-3.5" />
              Use output as input
            </Button>
          </div>
        </div>
      </div>
    </ToolLayout>
  )
}
