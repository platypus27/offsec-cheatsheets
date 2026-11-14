import { ChevronRight, RotateCcw, Undo2 } from 'lucide-react'
import { Button } from '@kryv/teal'
import { Link, useParams, useSearchParams } from 'react-router'
import { NoteLink } from '../../components/NoteLink'
import { PlaybookCommands } from '../../components/PlaybookCommands'
import { ToolProblems } from '../../components/ToolProblems'
import type { Content } from '../../lib/content'
import { walk } from '../../lib/playbooks'
import type { Tools } from '../../tools-source'
import { NotFound } from '../NotFound'
import { ToolLayout } from './ToolLayout'

export function PlaybooksPage({ tools }: { tools: Tools }) {
  return (
    <ToolLayout
      title="OSCP playbooks"
      description="OSCP decision paths. Choose a starting point and follow each step to the next check."
    >
      <ToolProblems problems={tools.problems.filter((problem) => problem.startsWith('_playbooks'))} />
      {tools.playbooks.length === 0 ? (
        <p className="text-teal-on-surface-variant">
          No playbooks yet. See the authoring guide for the format.
        </p>
      ) : (
        <ul className="grid gap-3">
          {tools.playbooks.map((playbook) => (
            <li key={playbook.id}>
              <Link to={`/tools/playbooks/${playbook.id}`} className="card-link group">
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold group-hover:text-teal-primary">{playbook.title}</span>
                  {playbook.description ? (
                    <span className="mt-1 block text-sm text-teal-on-surface-variant">
                      {playbook.description}
                    </span>
                  ) : null}
                </span>
                <ChevronRight aria-hidden="true" className="size-4 shrink-0 text-teal-on-surface-variant" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </ToolLayout>
  )
}

/**
 * Walks one playbook. The answered path lives in the URL (?path=a.b.c), so
 * the browser back button steps back and any point can be bookmarked.
 */
export function PlaybookPage({ content, tools }: { content: Content; tools: Tools }) {
  const { id = '' } = useParams()
  const [params, setParams] = useSearchParams()
  const playbook = tools.playbooks.find((item) => item.id === id)
  if (!playbook) return <NotFound />

  const raw = params.get('path')
  const path = walk(playbook, raw ? raw.split('.') : [])
  const node = playbook.nodes[path[path.length - 1]!]!
  const go = (next: string[]) => setParams(next.length > 1 ? { path: next.join('.') } : {})

  return (
    <ToolLayout
      title={playbook.title}
      crumbs={[{ label: 'Playbooks', href: '#/tools/playbooks' }]}
      description={playbook.description}
    >
      {path.length > 1 ? (
        <ol aria-label="Answers so far" className="mb-6 flex flex-wrap items-center gap-x-1 gap-y-2 text-sm">
          {path.slice(0, -1).map((step, index) => {
            const answer = playbook.nodes[step]!.options.find((option) => option.next === path[index + 1])
            return (
              <li key={`${step}-${index}`} className="flex items-center gap-1">
                <button type="button" onClick={() => go(path.slice(0, index + 1))} className="chip-link">
                  {playbook.nodes[step]!.prompt}: <span className="ml-1 font-semibold">{answer?.label}</span>
                </button>
                <ChevronRight aria-hidden="true" className="size-3.5 text-teal-on-surface-variant" />
              </li>
            )
          })}
        </ol>
      ) : null}

      <section aria-labelledby="step-prompt" className="section-card">
        <h2 id="step-prompt" className="font-teal-headline text-2xl font-bold">
          {node.prompt}
        </h2>
        {node.body ? <p className="mt-3 whitespace-pre-line text-teal-on-surface">{node.body}</p> : null}
        <PlaybookCommands refs={node.commands} content={content} />
        {node.links.length > 0 ? (
          <div className="mt-4">
            <p className="mb-1 text-xs font-bold uppercase tracking-wider text-teal-on-surface-variant">
              Notes
            </p>
            <ul className="flex flex-col gap-1">
              {node.links.map((ref) => (
                <li key={ref}>
                  <NoteLink refText={ref} content={content} />
                </li>
              ))}
            </ul>
          </div>
        ) : null}
        {node.options.length > 0 ? (
          <div className="mt-6 flex flex-wrap gap-2">
            {node.options.map((option) => (
              <Button key={`${option.label}-${option.next}`} onClick={() => go([...path, option.next])}>
                {option.label}
              </Button>
            ))}
          </div>
        ) : (
          <p className="mt-6 text-sm font-semibold text-teal-tertiary">End of this branch.</p>
        )}
      </section>

      <div className="mt-4 flex gap-2">
        <Button variant="ghost" size="sm" disabled={path.length < 2} onClick={() => go(path.slice(0, -1))}>
          <Undo2 aria-hidden="true" className="size-3.5" />
          Back
        </Button>
        <Button variant="ghost" size="sm" disabled={path.length < 2} onClick={() => go([])}>
          <RotateCcw aria-hidden="true" className="size-3.5" />
          Restart
        </Button>
      </div>
    </ToolLayout>
  )
}
