import { useDeferredValue, useMemo, useState } from 'react'
import { Crosshair } from 'lucide-react'
import { Badge, Button, TextArea, toast } from '@kryv/teal'
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
  const { importHost, defaultProfile } = useAppState()
  const label = host.hostname ? `${host.hostname} (${host.address})` : host.address || 'Unknown host'

  function useInProfile() {
    importHost(host)
    toast({
      title: `${host.address} loaded into ${defaultProfile.name}`,
      variant: 'success',
      duration: 2000,
    })
  }

  return (
    <section aria-label={label} className="section-card min-w-0">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-teal-headline text-lg font-bold">{label}</h2>
        <Button size="sm" onClick={useInProfile} disabled={!host.address}>
          <Crosshair aria-hidden="true" className="size-3.5" />
          Use in {defaultProfile.name}
        </Button>
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
      title="Scan parser"
      description="Paste nmap output (normal, -oG or -oX). Load an address and its ports into the current machine profile, or follow the matching reference notes."
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
        <div className="mt-6 grid min-w-0 grid-cols-1 gap-6">
          <p className="flex flex-wrap items-center gap-2 text-sm text-teal-on-surface-variant">
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
