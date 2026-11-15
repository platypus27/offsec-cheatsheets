import { ArrowRight, Crosshair, History, Pin, Search, Signpost, Wrench } from 'lucide-react'
import { Badge } from '@kryv/teal'
import { Key } from '../components/Key'
import { Link } from 'react-router'
import { companionKey } from '../lib/companions'
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
        Prepare Kali, choose a target, and let a companion guide the next concrete step. Reference notes and
        utilities stay close without getting in the way.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
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

      <div className="mt-4 flex flex-wrap items-center gap-3 rounded-xl border border-teal-outline-variant/40 px-4 py-3">
        <Crosshair aria-hidden="true" className="size-4 text-teal-primary" />
        <span className="text-sm font-semibold">{defaultProfile.name}</span>
        <span className="min-w-0 flex-1 truncate text-sm text-teal-on-surface-variant">{boxLabel}</span>
        <span className="text-xs font-semibold text-teal-primary">Press v to edit</span>
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
