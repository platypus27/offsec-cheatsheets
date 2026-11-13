import { Link } from 'react-router'
import type { Content } from '../lib/content'
import { pageHref } from '../lib/links'
import { splitRef } from '../lib/refs'

/** Link to a `section/page#heading` reference, labelled with the page and heading titles. */
export function NoteLink({ refText, content }: { refText: string; content: Content }) {
  const { slug, headingId } = splitRef(refText)
  const page = content.page(slug)
  if (!page) return <span className="text-sm text-teal-error">Missing note: {refText}</span>
  const heading = headingId ? page.headings.find((item) => item.id === headingId) : undefined
  return (
    <Link to={pageHref(slug, headingId)} className="prose-link text-sm">
      {page.title}
      {heading ? ` › ${heading.text}` : ''}
    </Link>
  )
}
