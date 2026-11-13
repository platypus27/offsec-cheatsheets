import MiniSearch, { type SearchOptions } from 'minisearch'
import type { Content } from './content'

export interface SearchResult {
  id: string
  pageSlug: string
  headingId: string | null
  heading: string
  pageTitle: string
  sectionTitle: string
  snippet: string
  score: number
}

interface IndexedChunk {
  id: string
  pageSlug: string
  headingId: string | null
  heading: string
  pageTitle: string
  sectionTitle: string
  tags: string
  text: string
  code: string
}

const MAX_RESULTS = 30
const SNIPPET_RADIUS = 60

// Headings are the strongest signal of "this section is about X"; page titles
// and tags scope it; code is what you usually want to copy; prose is context.
const baseOptions: SearchOptions = {
  boost: { heading: 4, pageTitle: 2, tags: 2, code: 1.5, text: 1 },
  prefix: (term) => term.length >= 2,
  fuzzy: (term) => (term.length >= 5 ? 0.2 : false),
}

function terms(query: string): string[] {
  return MiniSearch.getDefault('tokenize')(query)
    .map((term: string) => term.toLowerCase())
    .filter(Boolean)
}

/** Picks a short window of text around the first query term it finds. */
function snippetFor(chunk: IndexedChunk, queryTerms: string[]): string {
  const sources = [chunk.text, chunk.code].filter(Boolean)
  for (const source of sources) {
    const flat = source.replace(/\s+/g, ' ').trim()
    const lower = flat.toLowerCase()
    const hit = queryTerms
      .map((term) => lower.indexOf(term))
      .filter((index) => index >= 0)
      .sort((a, b) => a - b)[0]
    if (hit === undefined) continue
    // Widen the window outwards to whole words so it never opens mid-token.
    let start = Math.max(0, hit - SNIPPET_RADIUS)
    if (start > 0) start = flat.lastIndexOf(' ', start) + 1
    let end = Math.min(flat.length, hit + SNIPPET_RADIUS * 2)
    if (end < flat.length) {
      const space = flat.indexOf(' ', end)
      end = space === -1 ? flat.length : space
    }
    return `${start > 0 ? '…' : ''}${flat.slice(start, end)}${end < flat.length ? '…' : ''}`
  }
  const fallback = (chunk.text || chunk.code).replace(/\s+/g, ' ').trim()
  return fallback.length > SNIPPET_RADIUS * 3 ? `${fallback.slice(0, SNIPPET_RADIUS * 3)}…` : fallback
}

/**
 * Builds an in-memory full-text index over every heading-level chunk and
 * returns a query function. All-terms matching runs first so multi-word
 * queries stay precise; if nothing matches every term it widens to any term.
 */
export function createSearch(content: Content): (query: string) => SearchResult[] {
  const sectionTitles = new Map(content.sections.map((section) => [section.id, section.title]))
  const documents: IndexedChunk[] = content.pages.flatMap((page) =>
    page.chunks.map((chunk) => ({
      id: chunk.id,
      pageSlug: page.slug,
      headingId: chunk.headingId,
      heading: chunk.heading,
      pageTitle: page.title,
      sectionTitle: sectionTitles.get(page.section) ?? page.section,
      tags: page.tags.join(' '),
      text: chunk.text,
      code: chunk.code,
    })),
  )
  const byId = new Map(documents.map((document) => [document.id, document]))

  const index = new MiniSearch<IndexedChunk>({
    fields: ['heading', 'pageTitle', 'tags', 'text', 'code'],
    storeFields: [],
    searchOptions: baseOptions,
  })
  index.addAll(documents)

  return (query) => {
    const queryTerms = terms(query)
    if (queryTerms.length === 0) return []
    let hits = index.search(query, { combineWith: 'AND' })
    if (hits.length === 0) hits = index.search(query, { combineWith: 'OR' })
    return hits.slice(0, MAX_RESULTS).flatMap((hit) => {
      const chunk = byId.get(String(hit.id))
      if (!chunk) return []
      return [
        {
          id: chunk.id,
          pageSlug: chunk.pageSlug,
          headingId: chunk.headingId,
          heading: chunk.heading,
          pageTitle: chunk.pageTitle,
          sectionTitle: chunk.sectionTitle,
          snippet: snippetFor(chunk, queryTerms),
          score: hit.score,
        },
      ]
    })
  }
}
