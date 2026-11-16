import GithubSlugger from 'github-slugger'
import type { Heading as MdHeading, ListItem, Root, RootContent } from 'mdast'
import { toString } from 'mdast-util-to-string'
import remarkGfm from 'remark-gfm'
import remarkParse from 'remark-parse'
import { unified } from 'unified'
import { visit } from 'unist-util-visit'
import { parse as parseYaml } from 'yaml'
import { asRecord } from './guards'

export interface Heading {
  id: string
  text: string
  depth: 2 | 3
}

export interface FencedCommand {
  code: string
  language: string
}

/** One searchable unit: the prose and code under a single h2/h3 (or the page intro). */
export interface Chunk {
  id: string
  pageSlug: string
  headingId: string | null
  heading: string
  text: string
  code: string
  blocks: FencedCommand[]
  markdown: string
  lineOffset: number
}

/** A Markdown task-list item. `line` ties the rendered checkbox back to it. */
export interface Task {
  key: string
  label: string
  line: number
  defaultChecked: boolean
}

export interface Page {
  slug: string
  section: string
  title: string
  order: number
  tags: string[]
  body: string
  headings: Heading[]
  chunks: Chunk[]
  tasks: Task[]
}

export interface Section {
  id: string
  title: string
  order: number
  pages: Page[]
}

export interface Content {
  sections: Section[]
  /** Every page in reading order (section order, then page order). */
  pages: Page[]
  page(slug: string): Page | undefined
  section(id: string): Section | undefined
  neighbours(slug: string): { prev?: Page; next?: Page }
}

const UNORDERED = Number.MAX_SAFE_INTEGER

/** Storage key for a task: the label plus its occurrence index, so repeated labels stay independent. */
export const taskKey = (pageSlug: string, label: string, occurrence: number) =>
  `${pageSlug}::${label}::${occurrence}`
export const RESERVED_SECTIONS = new Set(['tools'])
export const taskPrefix = (pageSlug: string) => `${pageSlug}::`
const FRONTMATTER = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/

const markdown = unified().use(remarkParse).use(remarkGfm)

export function parseMarkdown(body: string): Root {
  return markdown.parse(body)
}

function humanize(name: string): string {
  const words = name.replace(/[-_]+/g, ' ').trim()
  return words.charAt(0).toUpperCase() + words.slice(1)
}

function readYaml(source: string): Record<string, unknown> {
  try {
    const data: unknown = parseYaml(source)
    return asRecord(data)
  } catch {
    return {}
  }
}

function splitFrontmatter(raw: string): { data: Record<string, unknown>; body: string } {
  const match = FRONTMATTER.exec(raw)
  if (!match) return { data: {}, body: raw }
  return { data: readYaml(match[1] ?? ''), body: raw.slice(match[0].length) }
}

const stringField = (value: unknown) => (typeof value === 'string' && value.trim() ? value.trim() : undefined)
const numberField = (value: unknown) =>
  typeof value === 'number' && Number.isFinite(value) ? value : UNORDERED
const tagsField = (value: unknown) =>
  Array.isArray(value) ? value.filter((tag): tag is string => typeof tag === 'string') : []

interface ChunkDraft {
  headingId: string | null
  heading: string
  text: string[]
  code: string[]
  blocks: FencedCommand[]
  startOffset?: number
  endOffset?: number
  startLine?: number
}

function collect(node: RootContent, draft: ChunkDraft) {
  if (node.type === 'code') {
    draft.code.push(node.value)
    draft.blocks.push({ code: node.value, language: node.lang || 'text' })
    return
  }
  if (node.type === 'heading') {
    draft.text.push(toString(node))
    return
  }
  // Inline code lands in both: it reads as prose but is often the exact command.
  visit(node, 'inlineCode', (inline) => {
    draft.code.push(inline.value)
  })
  const text = toString(node)
  if (text.trim()) draft.text.push(text)
}

/**
 * A heading's visible text. Inline HTML tags and image alt text are not
 * rendered as text, so rehype-slug (which slugs the rendered tree) ignores
 * them; slugging the same text keeps index ids and DOM ids identical.
 */
function headingText(node: MdHeading): string {
  return toString(node, { includeHtml: false, includeImageAlt: false })
}

/** Text of a task item without its nested sub-lists, as shown next to its checkbox. */
function taskLabel(item: ListItem): string {
  return item.children
    .filter((child) => child.type !== 'list')
    .map((child) => toString(child))
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Parses one Markdown file at `section/page.md`. Heading ids are produced by a
 * single github-slugger pass over every heading in document order (nested
 * ones included), which is exactly what rehype-slug does when the page
 * renders, so search hits and on-page anchors always agree.
 */
export function parsePage(path: string, raw: string): Page {
  const [section = '', file = ''] = path.split('/')
  const name = file.replace(/\.md$/, '')
  const slug = `${section}/${name}`
  const { data, body } = splitFrontmatter(raw)
  const tree = parseMarkdown(body)
  const slugger = new GithubSlugger()

  let firstH1: string | undefined
  const headings: Heading[] = []
  const drafts: ChunkDraft[] = []
  let current: ChunkDraft = { headingId: null, heading: '', text: [], code: [], blocks: [] }

  const ids = new Map<MdHeading, string>()
  const tasks: Task[] = []
  const occurrences = new Map<string, number>()
  visit(tree, (node) => {
    if (node.type === 'heading') ids.set(node, slugger.slug(headingText(node)))
    if (node.type === 'listItem' && typeof node.checked === 'boolean' && node.position) {
      const label = taskLabel(node)
      const seen = occurrences.get(label) ?? 0
      occurrences.set(label, seen + 1)
      tasks.push({
        key: taskKey(slug, label, seen),
        label,
        line: node.position.start.line,
        defaultChecked: node.checked,
      })
    }
  })

  for (const node of tree.children) {
    if (node.type === 'heading') {
      const heading = node as MdHeading
      const text = headingText(heading)
      const id = ids.get(heading) ?? ''
      if (heading.depth === 1) {
        firstH1 ??= text
        continue
      }
      if (heading.depth === 2 || heading.depth === 3) {
        headings.push({ id, text, depth: heading.depth })
        drafts.push(current)
        current = { headingId: id, heading: text, text: [], code: [], blocks: [] }
        continue
      }
    }
    collect(node, current)
    current.startOffset ??= node.position?.start.offset
    current.startLine ??= node.position?.start.line
    current.endOffset = node.position?.end.offset
  }
  drafts.push(current)

  const title = stringField(data.title) ?? firstH1 ?? humanize(name)
  const chunks = drafts
    .filter((draft) => draft.headingId !== null || draft.text.length > 0 || draft.code.length > 0)
    .map((draft) => ({
      // A heading of only punctuation slugs to "", which must not collide with the intro chunk.
      id: draft.headingId === null ? slug : `${slug}#${draft.headingId}`,
      pageSlug: slug,
      headingId: draft.headingId,
      heading: draft.heading || title,
      text: draft.text.join('\n'),
      code: draft.code.join('\n'),
      blocks: draft.blocks,
      markdown: body.slice(draft.startOffset ?? 0, draft.endOffset ?? 0),
      lineOffset: (draft.startLine ?? 1) - 1,
    }))

  return {
    slug,
    section,
    title,
    order: numberField(data.order),
    tags: tagsField(data.tags),
    body,
    headings,
    chunks,
    tasks,
  }
}

const byOrderThenTitle = (a: { order: number; title: string }, b: { order: number; title: string }) =>
  a.order - b.order || a.title.localeCompare(b.title)

/**
 * Builds the navigable content tree from a map of `section/file` paths to raw
 * file text. `section/_meta.yaml` supplies a section's title and order.
 */
export function buildContent(files: Record<string, string>): Content {
  const sections = new Map<string, Section>()
  const ensure = (id: string) => {
    let section = sections.get(id)
    if (!section) {
      section = { id, title: humanize(id), order: UNORDERED, pages: [] }
      sections.set(id, section)
    }
    return section
  }

  for (const [path, raw] of Object.entries(files)) {
    const parts = path.split('/')
    if (parts.length !== 2) continue
    const [sectionId = '', file = ''] = parts
    // `/tools/*` routes belong to the built-in tools; underscored folders hold tool data.
    if (RESERVED_SECTIONS.has(sectionId) || sectionId.startsWith('_')) continue
    if (file === '_meta.yaml') {
      const meta = readYaml(raw)
      const section = ensure(sectionId)
      section.title = stringField(meta.title) ?? section.title
      section.order = numberField(meta.order)
    } else if (file.endsWith('.md')) {
      ensure(sectionId).pages.push(parsePage(path, raw))
    }
  }

  const ordered = [...sections.values()].filter((section) => section.pages.length > 0).sort(byOrderThenTitle)
  for (const section of ordered) section.pages.sort(byOrderThenTitle)
  const pages = ordered.flatMap((section) => section.pages)
  const bySlug = new Map(pages.map((page, index) => [page.slug, index]))

  return {
    sections: ordered,
    pages,
    page: (slug) => {
      const index = bySlug.get(slug)
      return index === undefined ? undefined : pages[index]
    },
    section: (id) => ordered.find((section) => section.id === id),
    neighbours: (slug) => {
      const index = bySlug.get(slug)
      if (index === undefined) return {}
      return { prev: pages[index - 1], next: pages[index + 1] }
    },
  }
}
