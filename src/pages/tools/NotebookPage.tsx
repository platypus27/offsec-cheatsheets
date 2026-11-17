import { Button, TextArea } from '@kryv/teal'
import { Download, Crosshair } from 'lucide-react'
import { Link } from 'react-router'
import { LAB_STATUSES, emptyLabNote, exportLabNote, isNotebook, notebookKey } from '../../lib/notebook'
import { usePersistentState } from '../../lib/storage'
import { useAppState } from '../../state'
import { ToolLayout } from './ToolLayout'

const labels = {
  discovery: 'Discovery',
  foothold: 'Foothold',
  privileged: 'Privileged access',
  documented: 'Evidence documented',
}
const fields = [
  {
    key: 'entry',
    label: 'Entry point',
    hint: 'Service, vulnerability, account and the command that established access.',
  },
  {
    key: 'privilege',
    label: 'Privilege path',
    hint: 'Starting identity, exact permission or misconfiguration, resulting identity.',
  },
  {
    key: 'evidence',
    label: 'Evidence',
    hint: 'Local screenshot paths, output filenames, proof status and reproduction steps.',
  },
  { key: 'next', label: 'Next action', hint: 'One concrete check supported by the current evidence.' },
  {
    key: 'notes',
    label: 'Working notes',
    hint: 'Failed attempts, errors, source links and cleanup still required.',
  },
] as const

export function NotebookPage() {
  const { defaultProfile, variables, companionSessions } = useAppState()
  const [notebook, setNotebook] = usePersistentState('lab-notebook', isNotebook, { version: 1, items: {} })
  const address = variables.RHOST?.trim() ?? ''
  const key = notebookKey(defaultProfile.id, address)
  const note = notebook.items[key] ?? emptyLabNote()
  const findings = Object.entries(companionSessions.items).flatMap(([sessionKey, session]) => {
    // Companion keys encode [playbook, profile, host]. Keep findings with the same target.
    try {
      const parts: unknown = JSON.parse(sessionKey)
      if (!Array.isArray(parts) || parts[1] !== defaultProfile.id || parts[2] !== address) return []
      return Object.entries(session.findings)
        .filter(([, value]) => value.trim())
        .map(([step, value]) => ({ id: `${sessionKey}:${step}`, step, value }))
    } catch {
      return []
    }
  })
  function update(patch: Partial<typeof note>) {
    setNotebook((previous) => ({
      version: 1,
      items: { ...previous.items, [key]: { ...(previous.items[key] ?? emptyLabNote()), ...patch } },
    }))
  }
  function download() {
    const text = exportLabNote(defaultProfile.name, address, note)
    const url = URL.createObjectURL(new Blob([text], { type: 'text/markdown;charset=utf-8' }))
    const link = document.createElement('a')
    link.href = url
    link.download = `${defaultProfile.name.replace(/[^a-z0-9_-]/gi, '-').slice(0, 60) || 'target'}-lab-notes.md`
    link.click()
    window.setTimeout(() => URL.revokeObjectURL(url), 1000)
  }
  return (
    <ToolLayout
      title="Lab notebook"
      description="Keep the access chain, evidence and next action beside your commands. Notes are saved separately for each machine profile and target address in this browser."
      actions={
        <Button variant="secondary" onClick={download}>
          <Download aria-hidden="true" className="size-4" />
          Export this target
        </Button>
      }
    >
      <div className="section-card mb-6 flex flex-wrap items-center gap-3">
        <Crosshair aria-hidden="true" className="size-5 text-teal-primary" />
        <span className="font-bold">{defaultProfile.name}</span>
        <span className="break-all text-sm text-teal-on-surface-variant">
          {address || 'No target address set - press v to edit'}
        </span>
      </div>
      <label className="mb-5 grid max-w-sm gap-2 text-sm font-semibold">
        Current status
        <select
          aria-label="Current status"
          value={note.status}
          onChange={(event) => update({ status: event.target.value as typeof note.status })}
          className="rounded-lg border border-teal-outline-variant bg-teal-surface-container px-3 py-2.5 text-teal-on-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-primary"
        >
          {LAB_STATUSES.map((status) => (
            <option key={status} value={status}>
              {labels[status]}
            </option>
          ))}
        </select>
      </label>
      <div className="grid min-w-0 gap-5">
        {fields.map((field) => (
          <TextArea
            key={field.key}
            label={field.label}
            description={field.hint}
            value={note[field.key]}
            onChange={(event) => update({ [field.key]: event.target.value })}
            className="min-h-28"
          />
        ))}
      </div>
      {findings.length > 0 ? (
        <section aria-label="Companion findings for this target" className="mt-8">
          <h2 className="font-teal-headline text-xl font-bold">Companion findings</h2>
          <p className="mt-2 text-sm text-teal-on-surface-variant">
            Recorded in your companion sessions. Copy the relevant details into the evidence field before
            exporting.
          </p>
          {findings.map((finding) => (
            <div key={finding.id} className="section-card mt-3">
              <h3 className="text-sm font-bold">{finding.step}</h3>
              <p className="mt-2 whitespace-pre-wrap break-words text-sm">{finding.value}</p>
            </div>
          ))}
        </section>
      ) : null}
      <p className="mt-8 text-sm text-teal-on-surface-variant">
        Keep screenshots and output files on disk. Use the{' '}
        <Link to="/reporting/report" className="prose-link">
          evidence checklist
        </Link>{' '}
        before marking a target documented.
      </p>
    </ToolLayout>
  )
}
