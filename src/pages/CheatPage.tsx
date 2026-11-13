import { useEffect, useState } from 'react'
import { ArrowLeft, ArrowRight, Pin, PinOff, RotateCcw } from 'lucide-react'
import { Badge, Breadcrumb, Button } from '@kryv/teal'
import { Link, useLocation, useParams, useSearchParams } from 'react-router'
import { Markdown } from '../components/Markdown'
import { taskPrefix, type Content, type Page } from '../lib/content'
import { pageHref } from '../lib/links'
import { useAppState } from '../state'
import { NotFound } from './NotFound'

function PrevNext({ prev, next }: { prev?: Page; next?: Page }) {
  if (!prev && !next) return null
  return (
    <nav aria-label="Pages" className="mt-14 grid gap-3 border-t border-teal-outline-variant/30 pt-6 sm:grid-cols-2">
      {prev ? (
        <Link to={pageHref(prev.slug)} className="pager-link group">
          <span className="flex items-center gap-1 text-xs text-teal-on-surface-variant">
            <ArrowLeft aria-hidden="true" className="size-3.5" /> Previous
          </span>
          <span className="font-semibold text-teal-on-surface group-hover:text-teal-primary">{prev.title}</span>
        </Link>
      ) : (
        <span />
      )}
      {next ? (
        <Link to={pageHref(next.slug)} className="pager-link group sm:items-end sm:text-right">
          <span className="flex items-center gap-1 text-xs text-teal-on-surface-variant">
            Next <ArrowRight aria-hidden="true" className="size-3.5" />
          </span>
          <span className="font-semibold text-teal-on-surface group-hover:text-teal-primary">{next.title}</span>
        </Link>
      ) : null}
    </nav>
  )
}

/** Id of the last heading scrolled past the sticky header, tracked as the page scrolls. */
function useActiveHeading(ids: string[]): string | undefined {
  const [active, setActive] = useState<string | undefined>(ids[0])
  const key = ids.join(' ')
  useEffect(() => {
    const list = key.split(' ').filter(Boolean)
    let frame = 0
    function update() {
      frame = 0
      const line = 120
      let current = list[0]
      for (const id of list) {
        const element = document.getElementById(id)
        if (element && element.getBoundingClientRect().top <= line) current = id
      }
      // At the very bottom the last headings can never reach the line, so
      // light the final one - but only on pages long enough to scroll.
      const { scrollHeight } = document.documentElement
      if (scrollHeight > window.innerHeight && window.innerHeight + window.scrollY >= scrollHeight - 4) current = list[list.length - 1]
      setActive(current)
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [key])
  return active
}

/**
 * Page outline. Teal's AnchorNav renders bare `#id` hrefs, which a hash
 * router reads as routes (copied or new-tab links 404), so entries here are
 * real router links to `?h=id`.
 */
function OnThisPage({ page }: { page: Page }) {
  const active = useActiveHeading(page.headings.map((heading) => heading.id))
  if (page.headings.length < 2) return null
  return (
    <aside className="hidden w-60 shrink-0 xl:block">
      <nav aria-label="On this page" className="sticky top-20 max-h-[calc(100dvh-6rem)] overflow-y-auto pb-8 pr-2">
        <p className="mb-2 text-xs font-bold uppercase tracking-wider text-teal-on-surface-variant">On this page</p>
        <ul>
          {page.headings.map((heading) => (
            <li key={heading.id}>
              <Link
                to={pageHref(page.slug, heading.id)}
                replace
                aria-current={heading.id === active ? 'location' : undefined}
                className={`block border-l-2 py-1.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-primary ${
                  heading.depth === 3 ? 'pl-7' : 'pl-3'
                } ${
                  heading.id === active
                    ? 'border-teal-primary font-semibold text-teal-primary'
                    : 'border-teal-outline-variant/40 text-teal-on-surface-variant hover:text-teal-on-surface'
                }`}
              >
                {heading.text}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  )
}

function ChecklistProgress({ page }: { page: Page }) {
  const { checks, resetChecks } = useAppState()
  if (page.tasks.length === 0) return null
  // Counted from the tasks on the page now, so keys left behind by edited
  // Markdown never inflate it, and [x] defaults count until changed.
  const done = page.tasks.filter((task) => checks[task.key] ?? task.defaultChecked).length
  const total = page.tasks.length
  return (
    <div className="flex items-center gap-2">
      <Badge variant={done === total ? 'success' : 'neutral'}>
        {done} / {total} done
      </Badge>
      <Button variant="ghost" size="sm" onClick={() => resetChecks(taskPrefix(page.slug))}>
        <RotateCcw aria-hidden="true" className="size-3.5" />
        Reset
      </Button>
    </div>
  )
}

export function CheatPage({ content }: { content: Content }) {
  const { section = '', page: name = '' } = useParams()
  const [params] = useSearchParams()
  const { key: locationKey } = useLocation()
  const heading = params.get('h')
  const slug = `${section}/${name}`
  const page = content.page(slug)
  const { pins, togglePin, addRecent } = useAppState()

  useEffect(() => {
    if (page) addRecent(page.slug)
  }, [page, addRecent])

  // Under the hash router the browser cannot scroll to a heading itself, so
  // jump explicitly once the page body is in the DOM. The jump is instant:
  // teal's base.css makes scrolling smooth, and WebKit abandons a smooth
  // scroll part-way when layout shifts during a cold load.
  useEffect(() => {
    const target = heading ? document.getElementById(heading) : null
    if (target) {
      target.scrollIntoView({ block: 'start', behavior: 'instant' })
      target.classList.remove('heading-flash')
      void target.offsetWidth
      target.classList.add('heading-flash')
    } else {
      window.scrollTo({ top: 0, behavior: 'instant' })
    }
    // locationKey: re-selecting the URL you are already on (same search
    // result, same in-page link) is a new navigation and must jump again.
  }, [slug, heading, locationKey])

  if (!page) return <NotFound />
  const sectionInfo = content.section(page.section)
  const pinned = pins.includes(page.slug)
  const { prev, next } = content.neighbours(page.slug)

  return (
    <div className="mx-auto flex max-w-[84rem] gap-10 px-4 py-8 sm:px-8 lg:py-10">
      <main id="main-content" tabIndex={-1} className="min-w-0 flex-1 outline-none">
        <Breadcrumb
          items={[
            { label: 'Home', href: '#/' },
            { label: sectionInfo?.title ?? page.section, href: `#/${page.section}` },
            { label: page.title },
          ]}
        />
        <header className="mb-8 mt-4 flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="font-teal-headline text-3xl font-extrabold tracking-tight text-teal-on-surface sm:text-4xl">{page.title}</h1>
            {page.tags.length > 0 ? (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {page.tags.map((tag) => (
                  <Badge key={tag}>{tag}</Badge>
                ))}
              </div>
            ) : null}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <ChecklistProgress page={page} />
            <Button variant="secondary" size="sm" aria-pressed={pinned} onClick={() => togglePin(page.slug)}>
              {pinned ? <PinOff aria-hidden="true" className="size-3.5" /> : <Pin aria-hidden="true" className="size-3.5" />}
              {pinned ? 'Unpin' : 'Pin'}
            </Button>
          </div>
        </header>
        <Markdown page={page} content={content} />
        <PrevNext prev={prev} next={next} />
      </main>
      <OnThisPage page={page} />
    </div>
  )
}
