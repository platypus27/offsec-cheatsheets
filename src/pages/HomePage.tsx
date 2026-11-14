import { History, Pin, Search } from 'lucide-react'
import { Key } from '../components/Key'
import { Link } from 'react-router'
import type { Content, Page } from '../lib/content'
import { pageHref } from '../lib/links'
import { useAppState } from '../state'

function PageList({ title, icon, pages }: { title: string; icon: React.ReactNode; pages: Page[] }) {
  if (pages.length === 0) return null
  return (
    <section aria-label={title} className="mb-10">
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

export function HomePage({ content }: { content: Content }) {
  const { pins, recents } = useAppState()
  const resolve = (slugs: string[]) => slugs.flatMap((slug) => content.page(slug) ?? [])

  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="mx-auto max-w-5xl px-4 py-10 outline-none sm:px-8 lg:py-14"
    >
      <p className="mb-3 text-xs font-bold uppercase tracking-widest text-teal-primary">
        PEN-200 / Offline reference
      </p>
      <h1 className="font-teal-headline text-3xl font-extrabold tracking-tight sm:text-4xl">
        OSCP Cheatsheet
      </h1>
      <p className="mt-3 max-w-2xl text-teal-on-surface-variant">
        Cheatsheets and playbooks for OSCP. All current content is scoped to this certification.
      </p>
      <p className="mt-3 leading-7 text-teal-on-surface-variant">
        <Search aria-hidden="true" className="mr-1 inline size-4 align-middle" /> Press <Key>/</Key> to search
        every command, <Key>v</Key> to set your target, <Key>?</Key> for all shortcuts.
      </p>

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

      {content.sections.length === 0 ? (
        <p className="text-teal-on-surface-variant">
          No pages yet. Add Markdown files under content/&lt;section&gt;/.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {content.sections.map((section) => (
            <section key={section.id} aria-labelledby={`section-${section.id}`} className="section-card">
              <h2 id={`section-${section.id}`} className="font-teal-headline text-lg font-bold">
                <Link to={`/${section.id}`} className="hover:text-teal-primary">
                  {section.title}
                </Link>
              </h2>
              <ul className="mt-3 space-y-1">
                {section.pages.map((page) => (
                  <li key={page.slug}>
                    <Link
                      to={pageHref(page.slug)}
                      className="text-sm text-teal-on-surface-variant hover:text-teal-primary"
                    >
                      {page.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </main>
  )
}
