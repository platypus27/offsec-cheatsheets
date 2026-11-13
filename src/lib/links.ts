import type { Content } from './content'

export type ResolvedLink =
  | { kind: 'external'; href: string }
  | { kind: 'asset'; href: string }
  | { kind: 'internal'; to: string }

const EXTERNAL = /^[a-z][a-z0-9+.-]*:/i

/** In-app location for a page, optionally scrolled to a heading. */
export function pageHref(slug: string, headingId?: string | null): string {
  return headingId ? `/${slug}?h=${encodeURIComponent(headingId)}` : `/${slug}`
}

/**
 * Maps a Markdown link to an app route. Authors can write `#heading`,
 * `page` (same section), `section` or `section/` (a section index),
 * `section/page`, or relative file paths like `../web/sqli.md#union`.
 * Anything with a scheme opens externally; other files (images, PDFs)
 * stay plain links.
 */
export function resolveLink(href: string, currentSlug: string, content?: Content): ResolvedLink {
  if (EXTERNAL.test(href) || href.startsWith('//')) return { kind: 'external', href }
  const [path = '', hash] = href.split('#', 2)
  const headingId = hash || null
  const parts = path.split('/').filter((part) => part && part !== '.' && part !== '..')
  const last = parts[parts.length - 1] ?? ''
  if (/\.[a-z0-9]+$/i.test(last) && !last.endsWith('.md')) return { kind: 'asset', href }
  if (parts.length > 0) parts[parts.length - 1] = last.replace(/\.md$/, '')

  const section = currentSlug.split('/')[0] ?? ''
  if (parts.length === 0) return { kind: 'internal', to: pageHref(currentSlug, headingId) }
  if (parts.length >= 2) return { kind: 'internal', to: pageHref(parts.slice(-2).join('/'), headingId) }

  const name = parts[0]!
  const sibling = `${section}/${name}`
  const pointsAtSection = path.endsWith('/') || (content && !content.page(sibling) && content.section(name))
  return { kind: 'internal', to: pointsAtSection ? `/${name}` : pageHref(sibling, headingId) }
}
