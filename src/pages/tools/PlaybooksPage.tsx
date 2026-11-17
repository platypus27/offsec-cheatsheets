import { useEffect, useRef } from 'react'
import { ArrowLeft, ArrowRight, ChevronRight, Crosshair, RotateCcw, ScanSearch } from 'lucide-react'
import { Badge, Button, TextArea } from '@kryv/teal'
import { Link, useParams, useSearchParams } from 'react-router'
import { NoteLink } from '../../components/NoteLink'
import { PlaybookCommands } from '../../components/PlaybookCommands'
import { PlaybookServices } from '../../components/PlaybookServices'
import { ToolProblems } from '../../components/ToolProblems'
import { companionKey } from '../../lib/companions'
import type { Content } from '../../lib/content'
import { recommendedServices, serviceCheckPrefix, walk } from '../../lib/playbooks'
import { useAppState } from '../../state'
import type { Tools } from '../../tools-source'
import { NotFound } from '../NotFound'
import { ToolLayout } from './ToolLayout'

export function PlaybooksPage({ tools }: { tools: Tools }) {
  return (
    <ToolLayout
      title="OSCP companions"
      description="Choose a workflow. Your companion keeps the next decision, commands, findings, and progress together for the current target."
    >
      <ToolProblems problems={tools.problems.filter((problem) => problem.startsWith('_playbooks'))} />
      {tools.playbooks.length === 0 ? (
        <p className="text-teal-on-surface-variant">
          No companions yet. See the authoring guide for the format.
        </p>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {tools.playbooks.map((playbook) => (
            <li key={playbook.id}>
              <Link to={`/companions/${playbook.id}`} className="card-link group h-full">
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold group-hover:text-teal-primary">{playbook.title}</span>
                  {playbook.description ? (
                    <span className="mt-1 block text-sm leading-6 text-teal-on-surface-variant">
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

export function PlaybookPage({ content, tools }: { content: Content; tools: Tools }) {
  const { id = '' } = useParams()
  const [params, setParams] = useSearchParams()
  const {
    checks,
    resetChecks,
    defaultProfile,
    variables,
    companionSessions,
    updateCompanionSession,
    resetCompanionSession,
  } = useAppState()
  const servicePrefix = serviceCheckPrefix(id, defaultProfile.id, variables.RHOST?.trim() ?? '')
  const sessionKey = companionKey(id, defaultProfile.id, variables.RHOST?.trim() ?? '')
  const hasSelections = Object.entries(checks).some(
    ([key, checked]) => key.startsWith(servicePrefix) && checked,
  )
  const playbook = tools.playbooks.find((item) => item.id === id)
  const stored = companionSessions.items[sessionKey]
  const raw = params.get('path')
  const requestedPath = raw ? raw.split('.') : stored?.path
  const path = playbook ? walk(playbook, requestedPath ?? []) : []
  const pathKey = path.join('.')
  const promptRef = useRef<HTMLHeadingElement>(null)
  const stepKey = `${sessionKey}:${pathKey}`
  const previousStep = useRef(stepKey)

  useEffect(() => {
    if (previousStep.current !== stepKey) {
      promptRef.current?.focus({ preventScroll: true })
      promptRef.current?.scrollIntoView({ block: 'start', behavior: 'instant' })
    }
    previousStep.current = stepKey
  }, [stepKey])

  useEffect(() => {
    if (playbook && !raw) setParams({ path: pathKey }, { replace: true })
  }, [playbook, raw, pathKey, setParams])

  useEffect(() => {
    if (!playbook || stored?.path.join('.') === pathKey) return
    updateCompanionSession(sessionKey, playbook.start, (session) => ({ ...session, path }))
    // Only navigation synchronizes a URL into storage. A stored-session update
    // can commit before the router's pending URL, so observing stored.path here
    // would overwrite a just-saved transition with the previous URL's path.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playbook, sessionKey, pathKey, updateCompanionSession])

  if (!playbook) return <NotFound />
  const node = playbook.nodes[path[path.length - 1]!]!
  const completed = stored?.completed ?? []
  const findings = stored?.findings[node.id] ?? ''
  const phases = [...new Set(Object.values(playbook.nodes).map((item) => item.phase))]
  const phaseIndex = phases.indexOf(node.phase)
  const suggestions = recommendedServices(node, defaultProfile.ports)

  function showPath(next: string[]) {
    setParams({ path: next.join('.') })
    updateCompanionSession(sessionKey, playbook!.start, (session) => ({ ...session, path: next }))
  }

  function advance(next: string) {
    const nextPath = [...path, next]
    setParams({ path: nextPath.join('.') })
    updateCompanionSession(sessionKey, playbook!.start, (session) => ({
      ...session,
      path: nextPath,
      completed: [...new Set([...session.completed, node.id])],
    }))
  }

  function restart() {
    if (
      !window.confirm(
        'Restart this companion for the current target? Findings and service selections will be cleared.',
      )
    ) {
      return
    }
    resetCompanionSession(sessionKey)
    resetChecks(servicePrefix)
    setParams({ path: playbook!.start })
  }

  return (
    <ToolLayout
      title={playbook.title}
      crumbs={[{ label: 'Companions', href: '#/companions' }]}
      description={playbook.description}
      actions={
        <Link to="/tools/parse" className="chip-link">
          <ScanSearch aria-hidden="true" className="mr-1 inline size-3.5" /> Import scan
        </Link>
      }
    >
      <div className="mb-6 rounded-2xl border border-teal-outline-variant/40 bg-teal-surface-container-low p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2 text-sm">
            <Crosshair aria-hidden="true" className="size-4 shrink-0 text-teal-primary" />
            <span className="font-semibold">{defaultProfile.name}</span>
            <span className="truncate text-teal-on-surface-variant">
              {variables.RHOST || 'No box address set'}
            </span>
          </div>
          <Badge variant="info">{node.phase}</Badge>
        </div>
        <ol aria-label="Companion phases" className="mt-4 flex flex-wrap gap-x-2 gap-y-2">
          {phases.map((phase, index) => (
            <li
              key={phase}
              className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                index === phaseIndex
                  ? 'bg-teal-primary text-teal-on-primary'
                  : index < phaseIndex
                    ? 'bg-teal-primary/10 text-teal-primary'
                    : 'bg-teal-surface-container-high text-teal-on-surface-variant'
              }`}
            >
              {phase}
            </li>
          ))}
        </ol>
      </div>

      {path.length > 1 ? (
        <ol aria-label="Answers so far" className="mb-5 flex flex-wrap items-center gap-x-1 gap-y-2 text-sm">
          {path.slice(0, -1).map((step, index) => {
            const answer = playbook.nodes[step]!.options.find((option) => option.next === path[index + 1])
            return (
              <li key={`${step}-${index}`} className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => showPath(path.slice(0, index + 1))}
                  className="chip-link text-left"
                  aria-label={`${playbook.nodes[step]!.prompt}: ${answer?.label}`}
                >
                  {answer?.label}
                </button>
                <ChevronRight aria-hidden="true" className="size-3.5 text-teal-on-surface-variant" />
              </li>
            )
          })}
        </ol>
      ) : null}

      <section aria-labelledby="step-prompt" className="border-l-2 border-teal-primary pl-4 sm:pl-6">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-xs font-bold uppercase tracking-widest text-teal-primary">Current step</p>
          {completed.includes(node.id) ? <Badge variant="success">Previously completed</Badge> : null}
        </div>
        <h2
          id="step-prompt"
          ref={promptRef}
          tabIndex={-1}
          className="mt-2 scroll-mt-24 font-teal-headline text-2xl font-bold tracking-tight outline-none"
        >
          {node.prompt}
        </h2>
        {node.body ? (
          <p className="mt-3 whitespace-pre-line leading-7 text-teal-on-surface">{node.body}</p>
        ) : null}

        <nav
          aria-label="Step shortcuts"
          className="sticky top-16 z-10 mt-4 flex flex-wrap gap-2 rounded-xl border border-teal-outline-variant/40 bg-teal-surface px-3 py-2"
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              const field = document.getElementById('step-findings')
              field?.focus({ preventScroll: true })
              field?.scrollIntoView({ block: 'start', behavior: 'instant' })
            }}
          >
            Jump to findings
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              const outcomes = document.getElementById('step-outcomes')
              outcomes?.focus({ preventScroll: true })
              outcomes?.scrollIntoView({ block: 'start', behavior: 'instant' })
            }}
          >
            Choose outcome
          </Button>
        </nav>

        {node.why || node.lookFor || node.record ? (
          <div className="mt-5 grid gap-2 rounded-xl bg-teal-surface-container-low p-3">
            {[
              ['Why this matters', node.why],
              ['What to look for', node.lookFor],
              ['Record before moving on', node.record],
            ].map(([title, body]) =>
              body ? (
                <details key={title} className="rounded-lg px-2 py-1.5 open:bg-teal-surface-container">
                  <summary className="cursor-pointer text-sm font-semibold text-teal-on-surface-variant">
                    {title}
                  </summary>
                  <p className="mt-2 whitespace-pre-line pb-1 text-sm leading-6 text-teal-on-surface">
                    {body}
                  </p>
                </details>
              ) : null,
            )}
          </div>
        ) : null}

        <PlaybookCommands refs={node.commands} content={content} />
        <PlaybookServices node={node} prefix={servicePrefix} content={content} recommended={suggestions} />
        {node.links.length > 0 ? (
          <details className="mt-5 rounded-lg bg-teal-surface-container-low px-3 py-2">
            <summary className="cursor-pointer text-sm font-semibold text-teal-on-surface-variant">
              Open reference notes
            </summary>
            <ul className="mt-3 flex flex-col gap-2 pb-1">
              {node.links.map((ref) => (
                <li key={ref}>
                  <NoteLink refText={ref} content={content} />
                </li>
              ))}
            </ul>
          </details>
        ) : null}

        <TextArea
          id="step-findings"
          label="Findings and evidence"
          value={findings}
          onChange={(event) =>
            updateCompanionSession(sessionKey, playbook.start, (session) => ({
              ...session,
              findings: { ...session.findings, [node.id]: event.target.value },
            }))
          }
          placeholder="Record useful output, credentials, hostnames, errors, or the next concrete lead."
          className="mt-6 min-h-24 scroll-mt-36 font-mono text-xs"
        />

        {node.options.length > 0 ? (
          <div id="step-outcomes" tabIndex={-1} className="mt-6 grid scroll-mt-36 gap-2 outline-none">
            <p className="text-xs font-bold uppercase tracking-wider text-teal-on-surface-variant">
              Choose the outcome
            </p>
            <div className="flex flex-wrap gap-2">
              {node.options.map((option) => (
                <Button key={`${option.label}-${option.next}`} onClick={() => advance(option.next)}>
                  {option.label}
                  <ArrowRight aria-hidden="true" className="size-3.5" />
                </Button>
              ))}
            </div>
          </div>
        ) : node.services.length === 0 ? (
          <p className="mt-6 text-sm font-semibold text-teal-tertiary">
            End of this branch. Save your findings before leaving.
          </p>
        ) : null}
      </section>

      <div className="mt-6 flex gap-2 border-t border-teal-outline-variant/30 pt-4">
        <Button
          variant="ghost"
          size="sm"
          disabled={path.length < 2}
          onClick={() => showPath(path.slice(0, -1))}
        >
          <ArrowLeft aria-hidden="true" className="size-3.5" />
          Back
        </Button>
        <Button
          variant="ghost"
          size="sm"
          disabled={path.length < 2 && !hasSelections && !stored}
          onClick={restart}
        >
          <RotateCcw aria-hidden="true" className="size-3.5" />
          Restart
        </Button>
      </div>
    </ToolLayout>
  )
}
