import { useState } from 'react'
import { ChevronRight, Crosshair, Plus } from 'lucide-react'
import { Badge, Button, Input } from '@kryv/teal'
import { Link, useNavigate } from 'react-router'
import { useAppState } from '../../state'
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
      description="Each target keeps its own address, variables, ports and notes. Set active to use it in your default variable profile."
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
