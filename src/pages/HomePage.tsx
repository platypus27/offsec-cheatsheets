import {
  ArrowRight,
  BookOpen,
  Crosshair,
  History,
  NotebookPen,
  Pin,
  Search,
  Signpost,
  Terminal,
  Wrench,
} from 'lucide-react'
import { Badge } from '@kryv/teal'
import { Key } from '../components/Key'
import { Link } from 'react-router'
import { companionKey } from '../lib/companions'
import { walk } from '../lib/playbooks'
import type { Content, Page } from '../lib/content'
import { pageHref } from '../lib/links'
import { useAppState } from '../state'
import type { Tools } from '../tools-source'

function PageList({ title, icon, pages }: { title: string; icon: React.ReactNode; pages: Page[] }) {
  if (pages.length === 0) return null
  return (
    <section aria-label={title} className="mb-8">
      <h2 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-teal-on-surface-variant">
        {icon}
        {title}
      </h2>
      <ul className="flex flex-wrap gap-2">
        {pages.map((page) => (
          <li key={page.slug}>
            <Link to={pageHref(page.slug)} className="chip-link">
              {page.title}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}

export function HomePage({ content, tools }: { content: Content; tools: Tools }) {
  const { pins, recents, defaultProfile, variables, checks, companionSessions } = useAppState()
  const resolve = (slugs: string[]) => slugs.flatMap((slug) => content.page(slug) ?? [])
  const setupItems = tools.setup.flatMap((section) => section.items)
  const setupDone = setupItems.filter((item) => checks[`setup:${item.id}`]).length
  const boxLabel = variables.RHOST || 'No IP address set'
  const resumable = tools.playbooks.flatMap((playbook) => {
    const session =
      companionSessions.items[companionKey(playbook.id, defaultProfile.id, variables.RHOST?.trim() ?? '')]
    if (!session || (session.path.length < 2 && session.completed.length === 0)) return []
    const path = walk(playbook, session.path)
    return [{ playbook, prompt: playbook.nodes[path[path.length - 1]!]!.prompt }]
  })

  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="mx-auto max-w-5xl px-4 py-10 outline-none sm:px-8 lg:py-14"
    >
      <p className="mb-3 text-xs font-bold uppercase tracking-widest text-teal-primary">
        PEN-200 / Offline workspace
      </p>
      <h1 className="max-w-2xl font-teal-headline text-3xl font-extrabold tracking-tight sm:text-4xl">
        Your OSCP field workspace
      </h1>
      <p className="mt-3 max-w-2xl leading-7 text-teal-on-surface-variant">
        A task-based field manual, source-linked commands and a place to keep your lab evidence. Choose a
        target and continue from what you already know.
      </p>

      <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-4 border-y border-teal-outline-variant/30 py-4 sm:grid-cols-4">
        {[
          ['Reference pages', content.pages.length],
          ['Command groups', tools.recipes.length],
          ['Tools indexed', new Set(tools.recipes.flatMap((recipe) => recipe.tools)).size],
          ['Guided workflows', tools.playbooks.length],
        ].map(([label, value]) => (
          <div key={label} className="flex min-w-0 flex-col">
            <dt className="order-2 mt-1 text-xs font-semibold text-teal-on-surface-variant">{label}</dt>
            <dd className="order-1 font-teal-headline text-2xl font-extrabold text-teal-primary">{value}</dd>
          </div>
        ))}
      </dl>

      <section aria-label="Choose your task" className="mt-6 grid min-w-0 gap-3 sm:grid-cols-3">
        <Link to="/field-guide/start" className="card-link items-start p-4">
          <BookOpen aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-teal-primary" />
          <span className="min-w-0">
            <span className="block font-bold">Start from your task</span>
            <span className="mt-1 block text-xs leading-5 text-teal-on-surface-variant">
              Workflow index, service map and troubleshooting.
            </span>
          </span>
        </Link>
        <Link to="/tools/commands" className="card-link items-start p-4">
          <Terminal aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-teal-primary" />
          <span className="min-w-0">
            <span className="block font-bold">Explore commands</span>
            <span className="mt-1 block text-xs leading-5 text-teal-on-surface-variant">
              Filter by tool, service, phase or a phrase.
            </span>
          </span>
        </Link>
        <Link to="/tools/notebook" className="card-link items-start p-4">
          <NotebookPen aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-teal-primary" />
          <span className="min-w-0">
            <span className="block font-bold">Open lab notebook</span>
            <span className="mt-1 block text-xs leading-5 text-teal-on-surface-variant">
              Access chain, evidence and your next action.
            </span>
          </span>
        </Link>
      </section>

      <div className="mt-6 flex flex-wrap items-center gap-3 rounded-xl border border-teal-outline-variant/40 px-4 py-3">
        <Crosshair aria-hidden="true" className="size-4 text-teal-primary" />
        <span className="text-sm font-semibold">{defaultProfile.name}</span>
        <span className="min-w-0 flex-1 truncate text-sm text-teal-on-surface-variant">{boxLabel}</span>
        <span className="text-xs font-semibold text-teal-primary">Press v to edit</span>
      </div>
      {resumable.length > 0 ? (
        <section aria-label="Resume current target" className="mt-4 grid gap-3">
          {resumable.map(({ playbook, prompt }) => (
            <Link
              key={playbook.id}
              to={`/companions/${playbook.id}`}
              className="card-link border-teal-primary/50"
            >
              <History aria-hidden="true" className="size-5 shrink-0 text-teal-primary" />
              <span className="min-w-0 flex-1">
                <span className="block font-semibold">Resume {playbook.title}</span>
                <span className="mt-1 block text-sm text-teal-on-surface-variant">{prompt}</span>
              </span>
              <ArrowRight aria-hidden="true" className="size-4 shrink-0" />
            </Link>
          ))}
        </section>
      ) : null}

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Link to="/setup" className="card-link group p-5">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-teal-primary/10 text-teal-primary">
            <Wrench aria-hidden="true" className="size-5" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block font-teal-headline text-lg font-bold group-hover:text-teal-primary">
              Set up Kali
            </span>
            <span className="mt-1 block text-sm text-teal-on-surface-variant">
              Fixed paths, complete commands, no guessing.
            </span>
            <span className="mt-3 block text-xs font-semibold text-teal-on-surface-variant">
              {setupDone} / {setupItems.length} steps checked
            </span>
          </span>
          <ArrowRight aria-hidden="true" className="size-4 shrink-0 text-teal-primary" />
        </Link>
        <Link to="/companions" className="card-link group p-5">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-teal-primary/10 text-teal-primary">
            <Signpost aria-hidden="true" className="size-5" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block font-teal-headline text-lg font-bold group-hover:text-teal-primary">
              Start a companion
            </span>
            <span className="mt-1 block text-sm text-teal-on-surface-variant">
              Decisions, commands, methodology and findings.
            </span>
            <span className="mt-3 block text-xs font-semibold text-teal-on-surface-variant">
              {tools.playbooks.length} OSCP workflows
            </span>
          </span>
          <ArrowRight aria-hidden="true" className="size-4 shrink-0 text-teal-primary" />
        </Link>
      </div>

      <section aria-labelledby="companion-list" className="mt-10">
        <div className="mb-4 flex items-end justify-between gap-3">
          <div>
            <h2 id="companion-list" className="font-teal-headline text-xl font-bold">
              Companions
            </h2>
            <p className="mt-1 text-sm text-teal-on-surface-variant">
              Resume exactly where this target left off.
            </p>
          </div>
          <Link to="/companions" className="prose-link text-sm">
            View all
          </Link>
        </div>
        <ul className="divide-y divide-teal-outline-variant/30 border-y border-teal-outline-variant/30">
          {tools.playbooks.slice(0, 4).map((playbook) => {
            const key = companionKey(playbook.id, defaultProfile.id, variables.RHOST?.trim() ?? '')
            const session = companionSessions.items[key]
            const resume = Boolean(session && (session.path.length > 1 || session.completed.length > 0))
            return (
              <li key={playbook.id}>
                <Link
                  to={`/companions/${playbook.id}`}
                  className="group flex items-center gap-3 py-3 focus-visible:outline-none"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold group-hover:text-teal-primary">
                      {playbook.title}
                    </span>
                    <span className="mt-0.5 block truncate text-xs text-teal-on-surface-variant">
                      {playbook.description}
                    </span>
                  </span>
                  {resume ? <Badge variant="info">In progress</Badge> : null}
                  <ArrowRight
                    aria-hidden="true"
                    className="size-4 shrink-0 text-teal-on-surface-variant group-hover:text-teal-primary"
                  />
                </Link>
              </li>
            )
          })}
        </ul>
      </section>

      <div className="mt-10">
        <PageList
          title="Pinned"
          icon={<Pin aria-hidden="true" className="size-3.5" />}
          pages={resolve(pins)}
        />
        <PageList
          title="Recent"
          icon={<History aria-hidden="true" className="size-3.5" />}
          pages={resolve(recents)}
        />
      </div>

      <section
        aria-labelledby="reference-library"
        className="mt-4 border-t border-teal-outline-variant/30 pt-8"
      >
        <h2 id="reference-library" className="font-teal-headline text-lg font-bold">
          Reference library
        </h2>
        <p className="mt-2 text-sm leading-6 text-teal-on-surface-variant">
          <Search aria-hidden="true" className="mr-1 inline size-4 align-middle" /> Press <Key>/</Key> to
          search every command and heading, or browse a section.
        </p>
        <ul className="mt-4 flex flex-wrap gap-2">
          {content.sections.map((section) => (
            <li key={section.id}>
              <Link to={`/${section.id}`} className="chip-link">
                {section.title}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </main>
  )
}
