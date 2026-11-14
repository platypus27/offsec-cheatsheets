import type { Content } from './content'

/** A reference to a page or heading in the notes, written `section/page#heading-id`. */
export function splitRef(ref: string): { slug: string; headingId: string | null } {
  const [slug = '', headingId] = ref.split('#', 2)
  return { slug, headingId: headingId || null }
}

/** Describes why a note reference is broken, or returns null if it resolves. */
export function refProblem(ref: string, content: Content): string | null {
  const { slug, headingId } = splitRef(ref)
  const page = content.page(slug)
  if (!page) return `"${ref}" has no such page`
  if (headingId && !page.headings.some((heading) => heading.id === headingId))
    return `"${ref}" has no such heading`
  return null
}

export { isStringArray as isStringList } from './storage'

/** Treats any non-object YAML value as an empty record. */
export function record(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : {}
}
