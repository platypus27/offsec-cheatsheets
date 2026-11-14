import { useId, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import { useNavigate } from 'react-router'
import { CornerDownLeft, FileText, Hash, Search, Wrench } from 'lucide-react'
import { Dialog } from '@kryv/teal'
import type { Content } from '../lib/content'
import { pageHref } from '../lib/links'
import { createSearch } from '../lib/search'
import { useAppState } from '../state'
import { TOOL_LINKS } from '../tools-nav'
import type { Tools } from '../tools-source'
import { Key } from './Key'
import { TermHighlight } from './TermHighlight'

interface Option {
  id: string
  to: string
  title: string
  trail: string
  snippet?: string
  kind: 'heading' | 'page' | 'tool'
}

interface SearchPaletteProps {
  content: Content
  tools: Tools
  open: boolean
  onOpenChange: (open: boolean) => void
}

const searchCache = new WeakMap<Content, ReturnType<typeof createSearch>>()
function searchFor(content: Content) {
  let search = searchCache.get(content)
  if (!search) {
    search = createSearch(content)
    searchCache.set(content, search)
  }
  return search
}

function toolOptions(tools: Tools, query: string): Option[] {
  const needle = query.toLowerCase()
  const entries = [
    ...TOOL_LINKS.map((tool) => ({
      to: tool.to,
      title: tool.label,
      trail: 'Tools',
      haystack: `${tool.label} ${tool.keywords}`,
    })),
    ...tools.playbooks.map((playbook) => ({
      to: `/tools/playbooks/${playbook.id}`,
      title: playbook.title,
      trail: 'Tools / Playbooks',
      haystack: `${playbook.title} ${playbook.description} playbook`,
    })),
  ]
  // Title hits outrank keyword hits, so "stuck" finds the playbook named
  // "Stuck..." before the generic Playbooks tool that lists it as a keyword.
  const score = (entry: (typeof entries)[number]) =>
    entry.title.toLowerCase().includes(needle) ? 2 : entry.haystack.toLowerCase().includes(needle) ? 1 : 0
  return entries
    .map((entry) => ({ entry, score: score(entry) }))
    .filter(({ score: value }) => value > 0)
    .sort((a, b) => b.score - a.score)
    .map(({ entry }) => entry)
    .map((entry) => ({
      id: `tool:${entry.to}`,
      to: entry.to,
      title: entry.title,
      trail: entry.trail,
      kind: 'tool',
    }))
}

function PaletteBody({ content, tools, onClose }: { content: Content; tools: Tools; onClose: () => void }) {
  const navigate = useNavigate()
  const { recents } = useAppState()
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const listRef = useRef<HTMLDivElement>(null)
  const listId = useId()
  const search = searchFor(content)
  const trimmed = query.trim()

  const options: Option[] = useMemo(() => {
    if (trimmed) {
      return [
        ...toolOptions(tools, trimmed),
        ...search(trimmed).map((result): Option => ({
          id: result.id,
          to: pageHref(result.pageSlug, result.headingId),
          title: result.headingId ? result.heading : result.pageTitle,
          trail: result.headingId ? `${result.sectionTitle} / ${result.pageTitle}` : result.sectionTitle,
          snippet: result.snippet,
          kind: result.headingId !== null ? 'heading' : 'page',
        })),
      ]
    }
    return recents.flatMap((slug) => {
      const page = content.page(slug)
      if (!page) return []
      const section = content.section(page.section)
      return [
        {
          id: slug,
          to: pageHref(slug),
          title: page.title,
          trail: section?.title ?? '',
          kind: 'page' as const,
        },
      ]
    })
  }, [trimmed, search, recents, content, tools])

  const optionId = (index: number) => `${listId}-option-${index}`

  function choose(option: Option | undefined) {
    if (!option) return
    onClose()
    navigate(option.to)
  }

  function move(delta: number) {
    if (options.length === 0) return
    const next = (active + delta + options.length) % options.length
    setActive(next)
    document.getElementById(optionId(next))?.scrollIntoView({ block: 'nearest' })
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'ArrowDown' || (event.ctrlKey && event.key === 'n')) {
      event.preventDefault()
      move(1)
    } else if (event.key === 'ArrowUp' || (event.ctrlKey && event.key === 'p')) {
      event.preventDefault()
      move(-1)
    } else if (event.key === 'Enter') {
      event.preventDefault()
      choose(options[active])
    }
  }

  return (
    <div className="-mt-5 flex max-h-[min(36rem,80dvh)] flex-col">
      <div className="relative flex h-16 shrink-0 items-center border-b border-teal-outline-variant/30">
        <Search
          aria-hidden="true"
          className="pointer-events-none absolute left-4 size-4 text-teal-on-surface-variant"
        />
        <input
          autoFocus
          role="combobox"
          aria-expanded="true"
          aria-controls={listId}
          aria-activedescendant={options.length ? optionId(active) : undefined}
          aria-autocomplete="list"
          aria-label="Search the cheatsheet"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value)
            setActive(0)
            if (listRef.current) listRef.current.scrollTop = 0
          }}
          onKeyDown={onKeyDown}
          placeholder="Search commands, techniques, headings..."
          spellCheck={false}
          autoComplete="off"
          className="h-full w-full bg-transparent pl-11 pr-14 text-base text-teal-on-surface outline-none placeholder:text-teal-on-surface-variant/70"
        />
      </div>
      <div ref={listRef} className="min-h-0 flex-1 overflow-y-auto p-2">
        {!trimmed && options.length > 0 ? (
          <div className="px-3 pb-1 pt-2 text-xs font-bold uppercase tracking-wider text-teal-on-surface-variant">
            Recent
          </div>
        ) : null}
        <div role="listbox" id={listId} aria-label="Results">
          {options.map((option, index) => (
            <div
              key={option.id}
              id={optionId(index)}
              role="option"
              aria-selected={index === active}
              onMouseMove={() => setActive(index)}
              onClick={() => choose(option)}
              className={`flex cursor-pointer items-start gap-3 rounded-lg px-3 py-2.5 ${
                index === active
                  ? 'bg-teal-surface-container-high ring-1 ring-inset ring-teal-primary/40'
                  : ''
              }`}
            >
              {option.kind === 'heading' ? (
                <Hash aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-teal-primary" />
              ) : option.kind === 'tool' ? (
                <Wrench aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-teal-secondary" />
              ) : (
                <FileText
                  aria-hidden="true"
                  className="mt-0.5 size-4 shrink-0 text-teal-on-surface-variant"
                />
              )}
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold text-teal-on-surface">
                  <TermHighlight text={option.title} query={trimmed} />
                </span>
                <span className="block truncate text-xs text-teal-on-surface-variant">{option.trail}</span>
                {option.snippet ? (
                  <span className="mt-1 line-clamp-2 block break-words font-mono text-xs text-teal-on-surface-variant">
                    <TermHighlight text={option.snippet} query={trimmed} />
                  </span>
                ) : null}
              </span>
              {index === active ? (
                <CornerDownLeft aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-teal-primary" />
              ) : null}
            </div>
          ))}
        </div>
        {trimmed && options.length === 0 ? (
          <p className="px-3 py-10 text-center text-sm text-teal-on-surface-variant">
            No results for <span className="font-semibold text-teal-on-surface">&ldquo;{trimmed}&rdquo;</span>
          </p>
        ) : null}
        {!trimmed && options.length === 0 ? (
          <p className="px-3 py-10 text-center text-sm text-teal-on-surface-variant">
            Type to search every page, heading and command.
          </p>
        ) : null}
      </div>
      <div className="hidden h-10 shrink-0 items-center gap-4 border-t border-teal-outline-variant/30 px-4 text-xs text-teal-on-surface-variant sm:flex">
        <span className="flex items-center gap-1.5">
          <Key>↑</Key>
          <Key>↓</Key> Move
        </span>
        <span className="flex items-center gap-1.5">
          <Key>Enter</Key> Open
        </span>
        <span className="ml-auto flex items-center gap-1.5">
          <Key>Esc</Key> Close
        </span>
      </div>
    </div>
  )
}

export function SearchPalette({ content, tools, open, onOpenChange }: SearchPaletteProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      size="lg"
      title={<span className="sr-only">Search</span>}
      description={
        <span className="sr-only">Type to search, use the arrow keys to move and Enter to open.</span>
      }
      className="search-dialog top-[10vh] translate-y-0 overflow-hidden p-0"
    >
      {open ? <PaletteBody content={content} tools={tools} onClose={() => onOpenChange(false)} /> : null}
    </Dialog>
  )
}
