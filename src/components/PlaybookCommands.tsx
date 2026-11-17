import type { Content } from '../lib/content'
import { commandChunk } from '../lib/playbooks'
import { Markdown } from './Markdown'

/** Inline commands come directly from the referenced note heading, including its language. */
export function PlaybookCommands({
  refs,
  content,
  headingLevel = 3,
}: {
  refs: string[]
  content: Content
  headingLevel?: 3 | 4
}) {
  const Heading = headingLevel === 4 ? 'h4' : 'h3'
  const introduced = new Set<string>()
  return refs.map((ref) => {
    const chunk = commandChunk(ref, content)
    if (!chunk)
      return (
        <p key={ref} className="mt-4 text-sm text-teal-error">
          Commands unavailable for {ref}.
        </p>
      )
    const page = content.page(chunk.pageSlug)!
    const intro = introduced.has(page.slug) ? undefined : page.chunks.find((item) => item.headingId === null)
    introduced.add(page.slug)
    return (
      <section key={ref} aria-label={chunk.heading} className="mt-5 min-w-0">
        <Heading className="text-sm font-bold">{chunk.heading}</Heading>
        {intro ? <Markdown page={page} content={content} excerpt={intro} /> : null}
        <Markdown page={page} content={content} excerpt={chunk} />
      </section>
    )
  })
}
