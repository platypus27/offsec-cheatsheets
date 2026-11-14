import type { ReactNode } from 'react'
import { Breadcrumb } from '@kryv/teal'

export function ToolLayout({
  title,
  description,
  crumbs = [],
  actions,
  children,
}: {
  title: string
  description?: ReactNode
  crumbs?: { label: string; href: string }[]
  actions?: ReactNode
  children: ReactNode
}) {
  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="mx-auto max-w-5xl px-4 py-8 outline-none sm:px-8 lg:py-10"
    >
      <Breadcrumb items={[{ label: 'Home', href: '#/' }, ...crumbs, { label: title }]} />
      <header className="mb-8 mt-4 flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <h1 className="font-teal-headline text-3xl font-extrabold tracking-tight sm:text-4xl">{title}</h1>
          {description ? <p className="mt-2 max-w-2xl text-teal-on-surface-variant">{description}</p> : null}
        </div>
        {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
      </header>
      {children}
    </main>
  )
}
