import { ChevronRight } from 'lucide-react'
import { Breadcrumb } from '@kryv/teal'
import { Link, useParams } from 'react-router'
import type { Content } from '../lib/content'
import { pageHref } from '../lib/links'
import { NotFound } from './NotFound'

export function SectionPage({ content }: { content: Content }) {
  const { section: id = '' } = useParams()
  const section = content.section(id)
  if (!section) return <NotFound />
  return (
    <main id="main-content" tabIndex={-1} className="mx-auto max-w-4xl px-4 py-8 outline-none sm:px-8 lg:py-10">
      <Breadcrumb items={[{ label: 'Home', href: '#/' }, { label: section.title }]} />
      <h1 className="mb-8 mt-4 font-teal-headline text-3xl font-extrabold tracking-tight sm:text-4xl">{section.title}</h1>
      <ul className="grid gap-3">
        {section.pages.map((page) => (
          <li key={page.slug}>
            <Link to={pageHref(page.slug)} className="card-link group">
              <span className="min-w-0 flex-1">
                <span className="block font-semibold text-teal-on-surface group-hover:text-teal-primary">{page.title}</span>
                {page.headings.length > 0 ? (
                  <span className="mt-1 block truncate text-sm text-teal-on-surface-variant">
                    {page.headings.filter((heading) => heading.depth === 2).map((heading) => heading.text).join(' · ')}
                  </span>
                ) : null}
              </span>
              <ChevronRight aria-hidden="true" className="size-4 shrink-0 text-teal-on-surface-variant" />
            </Link>
          </li>
        ))}
      </ul>
    </main>
  )
}
