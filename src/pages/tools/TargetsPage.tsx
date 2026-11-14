import { useState } from 'react'
import { ChevronRight, Crosshair, Plus, Trash2 } from 'lucide-react'
import { AlertDialog, Badge, Button, IconButton, Input, TextArea } from '@kryv/teal'
import { Link, useNavigate, useParams } from 'react-router'
import { PortsTable } from '../../components/PortsTable'
import { Suggestions } from '../../components/Suggestions'
import type { Content } from '../../lib/content'
import { VARIABLE_NAME } from '../../lib/variables'
import { useAppState } from '../../state'
import type { Tools } from '../../tools-source'
import { NotFound } from '../NotFound'
import { ToolLayout } from './ToolLayout'

function AddTargetForm() {
  const { addTarget } = useAppState()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [address, setAddress] = useState('')
  return (
    <form
      aria-label="Add a target"
      className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end"
      onSubmit={(event) => {
        event.preventDefault()
        if (!name.trim() && !address.trim()) return
        const id = addTarget(name, address)
        navigate(`/tools/targets/${id}`)
      }}
    >
      <Input
        label="Name"
        placeholder="e.g. MS01"
        value={name}
        onChange={(event) => setName(event.target.value)}
        className="w-full sm:w-48"
      />
      <Input
        label="Address"
        placeholder="IP or hostname"
        value={address}
        onChange={(event) => setAddress(event.target.value)}
        className="w-full font-mono sm:w-56"
        spellCheck={false}
      />
      <Button type="submit" disabled={!name.trim() && !address.trim()}>
        <Plus aria-hidden="true" className="size-4" />
        Add target
      </Button>
    </form>
  )
}

export function TargetsPage() {
  const { targets, activeTarget, setActiveTarget } = useAppState()
  return (
    <ToolLayout
      title="Targets"
      description="Each target keeps its own address, variables, ports and notes. The active target fills {{RHOST}} and its variables into every command."
    >
      <AddTargetForm />
      {targets.length === 0 ? (
        <p className="text-teal-on-surface-variant">
          No targets yet. Add one above, or save hosts from the output parser.
        </p>
      ) : (
        <ul className="grid gap-3">
          {targets.map((target) => {
            const active = activeTarget?.id === target.id
            const open = target.ports.filter((port) => port.state.startsWith('open')).length
            return (
              <li key={target.id} className={`card-link ${active ? 'border-teal-primary/60' : ''}`}>
                <Link
                  to={`/tools/targets/${target.id}`}
                  className="group min-w-0 flex-1 focus-visible:outline-none"
                >
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold group-hover:text-teal-primary group-focus-visible:underline">
                      {target.name}
                    </span>
                    {active ? <Badge variant="info">Active</Badge> : null}
                  </span>
                  <span className="mt-0.5 flex flex-wrap gap-x-2 text-sm text-teal-on-surface-variant">
                    <span className="font-mono">{target.address || 'no address'}</span>
                    <span>
                      {open} open port{open === 1 ? '' : 's'}
                    </span>
                  </span>
                </Link>
                <Button
                  size="sm"
                  variant={active ? 'secondary' : 'primary'}
                  aria-pressed={active}
                  onClick={() => setActiveTarget(active ? null : target.id)}
                >
                  <Crosshair aria-hidden="true" className="size-3.5" />
                  {active ? 'Clear active' : 'Set active'}
                </Button>
                <ChevronRight aria-hidden="true" className="size-4 shrink-0 text-teal-on-surface-variant" />
              </li>
            )
          })}
        </ul>
      )}
    </ToolLayout>
  )
}

function TargetVariables({ targetId }: { targetId: string }) {
  const { targets, updateTarget } = useAppState()
  const target = targets.find((item) => item.id === targetId)!
  const [name, setName] = useState('')
  const normalized = name.trim().toUpperCase()
  const valid = VARIABLE_NAME.test(normalized) && normalized !== 'RHOST' && !(normalized in target.vars)
  const setVars = (vars: Record<string, string>) => updateTarget(targetId, { vars })

  return (
    <div className="grid gap-3">
      {Object.keys(target.vars)
        .sort()
        .map((key) => (
          <div key={key} className="flex items-end gap-2">
            <Input
              label={<span className="font-mono">{key}</span>}
              value={target.vars[key] ?? ''}
              onChange={(event) => setVars({ ...target.vars, [key]: event.target.value })}
              className="font-mono"
              spellCheck={false}
              autoComplete="off"
            />
            <IconButton
              label={`Remove ${key}`}
              variant="danger"
              onClick={() =>
                setVars(Object.fromEntries(Object.entries(target.vars).filter(([item]) => item !== key)))
              }
            >
              <Trash2 />
            </IconButton>
          </div>
        ))}
      <form
        className="flex items-end gap-2"
        aria-describedby="target-var-hint"
        onSubmit={(event) => {
          event.preventDefault()
          if (!valid) return
          setVars({ ...target.vars, [normalized]: '' })
          setName('')
        }}
      >
        <Input
          label="Add a target variable"
          aria-describedby="target-var-hint"
          placeholder="NAME"
          value={name}
          onChange={(event) => setName(event.target.value)}
          className="font-mono"
          spellCheck={false}
        />
        <Button type="submit" variant="secondary" disabled={!valid}>
          Add
        </Button>
      </form>
      <p id="target-var-hint" className="-mt-1 text-xs text-teal-on-surface-variant">
        Overrides the global value while this target is active, e.g. USER or DOMAIN.
      </p>
    </div>
  )
}

export function TargetPage({ content, tools }: { content: Content; tools: Tools }) {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const { targets, activeTarget, setActiveTarget, updateTarget, removeTarget } = useAppState()
  const target = targets.find((item) => item.id === id)
  if (!target) return <NotFound />
  const active = activeTarget?.id === target.id

  return (
    <ToolLayout
      title={target.name}
      crumbs={[{ label: 'Targets', href: '#/tools/targets' }]}
      actions={
        <>
          <Button
            variant={active ? 'secondary' : 'primary'}
            aria-pressed={active}
            onClick={() => setActiveTarget(active ? null : target.id)}
          >
            <Crosshair aria-hidden="true" className="size-4" />
            {active ? 'Clear active' : 'Set active'}
          </Button>
          <AlertDialog
            tone="danger"
            title={`Delete ${target.name}?`}
            description="Its ports, variables and notes are removed from this browser."
            confirmText="Delete"
            onConfirm={() => {
              removeTarget(target.id)
              navigate('/tools/targets')
            }}
            trigger={
              <Button variant="ghost">
                <Trash2 aria-hidden="true" className="size-4" />
                Delete
              </Button>
            }
          />
        </>
      }
    >
      <div className="grid gap-10">
        <section aria-labelledby="target-details" className="grid gap-4 sm:grid-cols-2">
          <h2 id="target-details" className="sr-only">
            Details
          </h2>
          <Input
            label="Name"
            description="Shown in the top bar and target list."
            value={target.name}
            onChange={(event) => updateTarget(target.id, { name: event.target.value })}
          />
          <Input
            label="Address"
            description="Filled into {{RHOST}} while active."
            value={target.address}
            onChange={(event) => updateTarget(target.id, { address: event.target.value.trim() })}
            className="font-mono"
            spellCheck={false}
          />
        </section>
        <section aria-labelledby="target-ports">
          <h2 id="target-ports" className="mb-3 font-teal-headline text-xl font-bold">
            Ports
          </h2>
          <PortsTable ports={target.ports} caption={`Ports on ${target.name}`} />
          <p className="mt-2 text-sm text-teal-on-surface-variant">
            Add or update ports by pasting scans into the{' '}
            <Link to="/tools/parse" className="prose-link">
              output parser
            </Link>
            .
          </p>
        </section>
        <section aria-labelledby="target-suggestions">
          <h2 id="target-suggestions" className="mb-3 font-teal-headline text-xl font-bold">
            Suggested notes
          </h2>
          <Suggestions ports={target.ports} rules={tools.rules} content={content} />
        </section>
        <section aria-labelledby="target-vars">
          <h2 id="target-vars" className="mb-3 font-teal-headline text-xl font-bold">
            Variables
          </h2>
          <TargetVariables targetId={target.id} />
        </section>
        <section aria-labelledby="target-notes">
          <h2 id="target-notes" className="mb-3 font-teal-headline text-xl font-bold">
            Notes
          </h2>
          <TextArea
            aria-labelledby="target-notes"
            autosize
            minRows={6}
            value={target.notes}
            onChange={(event) => updateTarget(target.id, { notes: event.target.value })}
            placeholder="Findings, credentials found, what you tried..."
          />
        </section>
      </div>
    </ToolLayout>
  )
}
