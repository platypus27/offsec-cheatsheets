import { Check, Copy, Folder, Terminal } from 'lucide-react'
import { Badge, Button, toast } from '@kryv/teal'
import { CodeBlock } from '../components/CodeBlock'
import { ToolProblems } from '../components/ToolProblems'
import type { SetupSection } from '../lib/setup'
import { useAppState } from '../state'
import type { Tools } from '../tools-source'
import { ToolLayout } from './tools/ToolLayout'

function SetupGroup({ section }: { section: SetupSection }) {
  const { checks, setCheck } = useAppState()

  async function copySection() {
    const text = section.items.map((item) => `# ${item.title}\n${item.command}`).join('\n\n')
    try {
      await navigator.clipboard.writeText(text)
      toast({ title: `Copied ${section.title}`, variant: 'success', duration: 1500 })
    } catch {
      toast({ title: 'Could not copy - copy each command block manually', variant: 'danger' })
    }
  }

  return (
    <section
      aria-labelledby={`setup-${section.id}`}
      className="min-w-0 border-t border-teal-outline-variant/40 py-8 first:border-t-0 first:pt-0"
    >
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div className="max-w-2xl">
          <h2 id={`setup-${section.id}`} className="font-teal-headline text-xl font-bold">
            {section.title}
          </h2>
          <p className="mt-1 text-sm leading-6 text-teal-on-surface-variant">{section.description}</p>
        </div>
        <Button variant="secondary" size="sm" onClick={copySection}>
          <Copy aria-hidden="true" className="size-3.5" />
          Copy section
        </Button>
      </div>
      <div className="grid min-w-0 grid-cols-1 gap-5">
        {section.items.map((item) => {
          const key = `setup:${item.id}`
          const done = checks[key] ?? false
          return (
            <article
              key={item.id}
              className="min-w-0 rounded-2xl border border-teal-outline-variant/40 bg-teal-surface-container-low p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold">{item.title}</h3>
                  <p className="mt-1 max-w-2xl text-sm leading-6 text-teal-on-surface-variant">
                    {item.description}
                  </p>
                </div>
                <label className="flex min-h-10 scroll-mt-24 cursor-pointer items-center gap-2 px-2 py-2 text-xs font-semibold text-teal-on-surface-variant">
                  <input
                    type="checkbox"
                    checked={done}
                    onChange={(event) => setCheck(key, event.target.checked)}
                    className="size-4 scroll-mt-24 accent-teal-primary"
                  />
                  {done ? 'Complete' : 'Mark complete'}
                </label>
              </div>
              <div className="mt-3 flex items-center gap-2 font-mono text-xs text-teal-on-surface-variant">
                {item.destination === 'PATH' ? (
                  <Terminal aria-hidden="true" className="size-3.5 shrink-0" />
                ) : (
                  <Folder aria-hidden="true" className="size-3.5 shrink-0" />
                )}
                <span className="break-all">{item.destination}</span>
              </div>
              <CodeBlock
                code={item.command}
                language="bash"
                accessibleLabel={`${item.title} setup commands`}
              />
              <details className="mt-3 rounded-lg bg-teal-surface-container px-3 py-2 text-sm">
                <summary className="cursor-pointer font-medium text-teal-on-surface-variant">
                  Verification command
                </summary>
                <code className="mt-2 block overflow-x-auto py-1 font-mono text-xs text-teal-on-surface">
                  {item.verify}
                </code>
              </details>
            </article>
          )
        })}
      </div>
    </section>
  )
}

export function SetupPage({ tools }: { tools: Tools }) {
  const { checks } = useAppState()
  const items = tools.setup.flatMap((section) => section.items)
  const completed = items.filter((item) => checks[`setup:${item.id}`]).length

  return (
    <ToolLayout
      title="Set up your OSCP workspace"
      description="Copyable Kali Linux commands with fixed paths, so every tool and payload is where the cheatsheets expect it."
      actions={
        items.length ? (
          <Badge variant="info">
            {completed} / {items.length} complete
          </Badge>
        ) : undefined
      }
    >
      <ToolProblems problems={tools.problems.filter((problem) => problem.startsWith('_setup'))} />
      <div className="mb-8 rounded-xl border border-teal-primary/25 bg-teal-primary/5 px-4 py-3 text-sm leading-6 text-teal-on-surface-variant">
        Run these commands in Kali, in order. They require network access and some require sudo. Check-offs
        are manual; this offline page cannot run commands or detect installed tools. Everything is saved only
        in this browser.
      </div>
      {tools.setup.length ? (
        <div>
          {tools.setup.map((section) => (
            <SetupGroup key={section.id} section={section} />
          ))}
        </div>
      ) : (
        <p className="text-teal-on-surface-variant">No setup steps are available. Check the setup catalog.</p>
      )}
      <div className="mt-8 flex items-center gap-2 text-sm text-teal-on-surface-variant">
        <Check aria-hidden="true" className="size-4 text-teal-primary" />
        After setup, choose a target and start a companion.
      </div>
    </ToolLayout>
  )
}
