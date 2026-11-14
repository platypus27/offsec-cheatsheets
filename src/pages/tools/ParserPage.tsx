import { useDeferredValue, useMemo, useState } from 'react'
import { Crosshair, Save } from 'lucide-react'
import { Badge, Button, TextArea, toast } from '@kryv/teal'
import { useNavigate } from 'react-router'
import { PortsTable } from '../../components/PortsTable'
import { Suggestions } from '../../components/Suggestions'
import { ToolProblems } from '../../components/ToolProblems'
import type { Content } from '../../lib/content'
import { parseScan, type ScannedHost } from '../../lib/nmap'
import { useAppState } from '../../state'
import type { Tools } from '../../tools-source'
import { ToolLayout } from './ToolLayout'

const FORMAT_LABEL = {
  'nmap-normal': 'nmap (normal)',
  'nmap-grepable': 'nmap (grepable)',
  'nmap-xml': 'nmap (XML)',
  unknown: 'unrecognised',
} as const

function HostResult({ host, content, tools }: { host: ScannedHost; content: Content; tools: Tools }) {
  const { importHost, setActiveTarget } = useAppState()
  const navigate = useNavigate()
  const label = host.hostname ? `${host.hostname} (${host.address})` : host.address || 'Unknown host'

  function save(activate: boolean) {
    const id = importHost(host)
    if (activate) setActiveTarget(id)
    toast({
      title: activate ? `Saved and targeting ${host.address || 'host'}` : 'Saved to targets',
      variant: 'success',
      duration: 2000,
    })
    if (activate) navigate(`/tools/targets/${id}`)
  }

  return (
    <section aria-label={label} className="section-card">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-teal-headline text-lg font-bold">{label}</h2>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="secondary" onClick={() => save(false)} disabled={!host.address}>
            <Save aria-hidden="true" className="size-3.5" />
            Save to targets
          </Button>
          <Button size="sm" onClick={() => save(true)} disabled={!host.address}>
            <Crosshair aria-hidden="true" className="size-3.5" />
            Save and target
          </Button>
        </div>
      </div>
      <PortsTable ports={host.ports} caption={`Ports on ${label}`} />
      <h3 className="mb-3 mt-6 text-sm font-bold uppercase tracking-wider text-teal-on-surface-variant">
        Suggested notes
      </h3>
      <Suggestions ports={host.ports} rules={tools.rules} content={content} />
    </section>
  )
}

export function ParserPage({ content, tools }: { content: Content; tools: Tools }) {
  const [input, setInput] = useState('')
  const deferred = useDeferredValue(input)
  const result = useMemo(() => parseScan(deferred), [deferred])

  return (
    <ToolLayout
      title="Output parser"
      description="Paste nmap output (normal, -oG or -oX). Ports are extracted and matched against your rules in content/_rules.yaml."
    >
      <ToolProblems problems={tools.problems.filter((problem) => problem.startsWith('_rules'))} />
      <TextArea
        label="Scan output"
        value={input}
        onChange={(event) => setInput(event.target.value)}
        spellCheck={false}
        placeholder="Nmap scan report for 10.10.10.5 ..."
        className="min-h-40 font-mono text-xs"
      />
      {deferred.trim() ? (
        <div className="mt-6 grid gap-6">
          <p className="flex items-center gap-2 text-sm text-teal-on-surface-variant">
            Detected format{' '}
            <Badge variant={result.format === 'unknown' ? 'warning' : 'info'}>
              {FORMAT_LABEL[result.format]}
            </Badge>
          </p>
          {result.format === 'unknown' ? (
            <p className="text-sm text-teal-on-surface-variant">
              No hosts or ports found. Paste the full nmap output including the PORT table.
            </p>
          ) : (
            result.hosts.map((host, index) => (
              <HostResult key={`${host.address}-${index}`} host={host} content={content} tools={tools} />
            ))
          )}
        </div>
      ) : null}
    </ToolLayout>
  )
}
