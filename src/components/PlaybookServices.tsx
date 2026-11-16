import { Checkbox } from '@kryv/teal'
import type { Content } from '../lib/content'
import type { PlaybookNode } from '../lib/playbooks'
import { useAppState } from '../state'
import { PlaybookCommands } from './PlaybookCommands'

export function PlaybookServices({
  node,
  prefix,
  content,
  recommended = [],
}: {
  node: PlaybookNode
  prefix: string
  content: Content
  recommended?: string[]
}) {
  const { checks, setCheck } = useAppState()
  if (node.services.length === 0) return null
  const key = (id: string) => `${prefix}${node.id}:${id}`
  const selected = node.services.filter((service) => checks[key(service.id)])
  return (
    <div className="mt-6 min-w-0">
      <fieldset>
        <legend className="mb-3 text-sm font-bold">Services confirmed in Nmap</legend>
        <div className="grid gap-3 sm:grid-cols-2">
          {node.services.map((service) => (
            <div key={service.id}>
              <Checkbox
                label={service.title}
                checked={checks[key(service.id)] ?? false}
                onCheckedChange={(checked) => setCheck(key(service.id), checked === true)}
              />
              {recommended.includes(service.id) ? (
                <p className="ml-7 mt-1 text-xs font-medium text-teal-primary">
                  Suggested by the current profile's scan
                </p>
              ) : null}
            </div>
          ))}
        </div>
      </fieldset>
      {selected.length === 0 ? (
        <p className="mt-4 text-sm text-teal-on-surface-variant">
          Select confirmed services to show their enumeration commands.
        </p>
      ) : null}
      <div className="mt-5 grid min-w-0 grid-cols-1 gap-4">
        {selected.map((service) => (
          <section
            key={service.id}
            aria-label={service.title}
            className="min-w-0 rounded-xl border border-teal-outline-variant/40 bg-teal-surface-container-low p-4"
          >
            <details open>
              <summary className="cursor-pointer font-teal-headline text-xl font-bold">
                {service.title}
              </summary>
              {service.body ? (
                <p className="mt-2 whitespace-pre-line text-sm text-teal-on-surface-variant">
                  {service.body}
                </p>
              ) : null}
              <PlaybookCommands refs={service.commands} content={content} headingLevel={4} />
            </details>
          </section>
        ))}
      </div>
    </div>
  )
}
