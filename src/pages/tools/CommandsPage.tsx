import { useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { Button, Input } from '@kryv/teal'
import { ChevronDown, Terminal } from 'lucide-react'
import { PlaybookCommands } from '../../components/PlaybookCommands'
import { ToolProblems } from '../../components/ToolProblems'
import type { Content } from '../../lib/content'
import { pageHref } from '../../lib/links'
import { commandChunk } from '../../lib/playbooks'
import type { Recipe } from '../../lib/recipes'
import type { Tools } from '../../tools-source'
import { ToolLayout } from './ToolLayout'

function RecipeCard({ recipe, content }: { recipe: Recipe; content: Content }) {
  const [open, setOpen] = useState(false)
  const chunk = commandChunk(recipe.ref, content)!
  return (
    <details className="section-card min-w-0 p-0" onToggle={(event) => setOpen(event.currentTarget.open)}>
      <summary className="flex cursor-pointer list-none items-start gap-3 rounded-xl p-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-primary sm:p-5">
        <Terminal aria-hidden="true" className="mt-1 size-4 shrink-0 text-teal-primary" />
        <span className="min-w-0 flex-1">
          <span className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-teal-on-surface-variant">
            {recipe.phase}
          </span>
          <span role="heading" aria-level={2} className="block font-teal-headline font-bold">
            {chunk.heading}
          </span>
          <span className="mt-1 block text-sm text-teal-on-surface-variant">
            {recipe.tools.join(' · ')} / {recipe.services.join(' · ')}
          </span>
        </span>
        <ChevronDown
          aria-hidden="true"
          className={`mt-1 size-4 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </summary>
      {open ? (
        <div className="min-w-0 border-t border-teal-outline-variant/30 px-4 pb-4 sm:px-5 sm:pb-5">
          <PlaybookCommands refs={[recipe.ref]} content={content} />
          <Link
            to={pageHref(chunk.pageSlug, chunk.headingId)}
            className="prose-link mt-3 inline-block text-sm"
          >
            Open full note
          </Link>
        </div>
      ) : null}
    </details>
  )
}

export function CommandsPage({ content, tools }: { content: Content; tools: Tools }) {
  const [params, setParams] = useSearchParams()
  const [limit, setLimit] = useState(24)
  const query = params.get('q') ?? ''
  const selectedTool = params.get('tool') ?? ''
  const service = params.get('service') ?? ''
  const phase = params.get('phase') ?? ''
  const choices = (key: 'tools' | 'services' | 'phase', selected: string) =>
    [...new Set([...tools.recipes.flatMap((recipe) => recipe[key]), ...(selected ? [selected] : [])])].sort(
      (a, b) => a.localeCompare(b),
    )
  const terms = query.toLowerCase().trim().split(/\s+/).filter(Boolean)
  const results = tools.recipes.filter((recipe) => {
    if (selectedTool && !recipe.tools.includes(selectedTool)) return false
    if (service && !recipe.services.includes(service)) return false
    if (phase && recipe.phase !== phase) return false
    const chunk = commandChunk(recipe.ref, content)!
    const text = [chunk.heading, chunk.text, chunk.code, ...recipe.tools, ...recipe.services, recipe.phase]
      .join(' ')
      .toLowerCase()
    return terms.every((term) => text.includes(term))
  })
  function update(key: string, value: string) {
    const next = new URLSearchParams(params)
    if (value) next.set(key, value)
    else next.delete(key)
    setParams(next, { replace: key === 'q' })
    setLimit(24)
  }
  const filters = [
    { key: 'tool', label: 'Tool', value: selectedTool, options: choices('tools', selectedTool) },
    { key: 'service', label: 'Service', value: service, options: choices('services', service) },
    { key: 'phase', label: 'Phase', value: phase, options: choices('phase', phase) },
  ]
  return (
    <ToolLayout
      title="Command explorer"
      description="Find a task by tool, service or phase. Open a command group for prerequisites, target values and copyable commands from the original note."
    >
      <ToolProblems problems={tools.problems.filter((problem) => problem.startsWith('_recipes'))} />
      <div className="section-card mb-5 grid gap-4">
        <Input
          label="Find a command"
          type="search"
          value={query}
          onChange={(event) => update('q', event.target.value)}
          placeholder="Try a task, error, flag or command…"
        />
        <div className="grid gap-3 sm:grid-cols-3">
          {filters.map((filter) => (
            <label key={filter.key} className="grid min-w-0 gap-1.5 text-sm font-semibold">
              {filter.label}
              <select
                aria-label={filter.label}
                value={filter.value}
                onChange={(event) => update(filter.key, event.target.value)}
                className="w-full min-w-0 rounded-lg border border-teal-outline-variant bg-teal-surface-container px-3 py-2.5 text-sm text-teal-on-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-primary"
              >
                <option value="">All {filter.label.toLowerCase()}s</option>
                {filter.options.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
          ))}
        </div>
      </div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <p role="status" className="text-sm text-teal-on-surface-variant">
          {results.length} command {results.length === 1 ? 'group' : 'groups'}
        </p>
        {params.size > 0 ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setParams({})
              setLimit(24)
            }}
          >
            Clear filters
          </Button>
        ) : null}
      </div>
      {results.length ? (
        <div className="grid min-w-0 gap-3">
          {results.slice(0, limit).map((recipe) => (
            <RecipeCard key={recipe.ref} recipe={recipe} content={content} />
          ))}
          {results.length > limit ? (
            <Button variant="secondary" onClick={() => setLimit((count) => count + 24)}>
              Show more command groups
            </Button>
          ) : null}
        </div>
      ) : (
        <p className="section-card text-sm text-teal-on-surface-variant">
          No command groups match these filters.
        </p>
      )}
    </ToolLayout>
  )
}
