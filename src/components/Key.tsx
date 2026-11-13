import { Kbd } from '@kryv/teal'
import type { ReactNode } from 'react'

// Teal's Kbd uses on-surface-variant text at ~9px, which measures 4.3:1 on
// its own fill (below WCAG AA 4.5:1). Full on-surface text fixes it until
// the upstream token is adjusted.
export function Key({ children }: { children: ReactNode }) {
  return <Kbd className="text-teal-on-surface">{children}</Kbd>
}
