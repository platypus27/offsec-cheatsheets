import { Crosshair, Trash2 } from 'lucide-react'
import { AlertDialog, Button, Input, TextArea } from '@kryv/teal'
import { Link, useNavigate, useParams } from 'react-router'
import { PortsTable } from '../../components/PortsTable'
import { Suggestions } from '../../components/Suggestions'
import { TargetVariables } from '../../components/TargetVariables'
import type { Content } from '../../lib/content'
import { useAppState } from '../../state'
import type { Tools } from '../../tools-source'
import { NotFound } from '../NotFound'
import { ToolLayout } from './ToolLayout'

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
          <TargetVariables variables={target.vars} onChange={(vars) => updateTarget(target.id, { vars })} />
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
