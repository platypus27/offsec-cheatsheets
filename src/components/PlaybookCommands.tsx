import type { Content } from '../lib/content'
import { commandChunk } from '../lib/playbooks'
import { CodeBlock } from './CodeBlock'

/** Inline commands come directly from the referenced note heading, including its language. */
export function PlaybookCommands({ refs, content }: { refs: string[]; content: Content }) {
  return refs.map((ref) => {
    const chunk = commandChunk(ref, content)
    if (!chunk)
      return (
        <p key={ref} className="mt-4 text-sm text-teal-error">
          Commands unavailable for {ref}.
        </p>
      )
    return (
      <section key={ref} aria-label={chunk.heading} className="mt-5 min-w-0">
        <h3 className="text-sm font-bold">{chunk.heading}</h3>
        {chunk.blocks.map((block, index) => (
          <CodeBlock key={index} code={block.code} language={block.language} />
        ))}
      </section>
    )
  })
}
