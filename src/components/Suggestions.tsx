import { Lightbulb } from 'lucide-react'
import type { Content } from '../lib/content'
import type { ScannedPort } from '../lib/nmap'
import { suggest, type Rule } from '../lib/rules'
import { NoteLink } from './NoteLink'

/** Notes your own rules point to for the open ports given. */
export function Suggestions({
  ports,
  rules,
  content,
}: {
  ports: ScannedPort[]
  rules: Rule[]
  content: Content
}) {
  const results = suggest(ports, rules)
  if (rules.length === 0) {
    return (
      <p className="text-sm text-teal-on-surface-variant">
        No rules yet. Add them to <code className="inline-code">content/_rules.yaml</code> to get note
        suggestions here.
      </p>
    )
  }
  if (results.length === 0)
    return <p className="text-sm text-teal-on-surface-variant">No rule matches these open ports.</p>
  return (
    <ul className="grid gap-3">
      {results.map(({ rule, ports: matched }) => (
        <li
          key={rule.id}
          className="rounded-xl border border-teal-outline-variant/40 bg-teal-surface-container-low p-4"
        >
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <Lightbulb aria-hidden="true" className="size-4 text-teal-primary" />
            <span className="font-semibold">{rule.title}</span>
            <span className="font-mono text-xs text-teal-on-surface-variant">
              {matched.map((port) => `${port.port}/${port.protocol}`).join(', ')}
            </span>
          </div>
          {rule.note ? <p className="mt-2 text-sm text-teal-on-surface-variant">{rule.note}</p> : null}
          <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
            {rule.suggest.map((ref) => (
              <li key={ref}>
                <NoteLink refText={ref} content={content} />
              </li>
            ))}
          </ul>
        </li>
      ))}
    </ul>
  )
}
