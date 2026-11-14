import { Dialog } from '@kryv/teal'
import { Key } from './Key'

const SHORTCUTS: { keys: string[]; action: string }[] = [
  { keys: ['/'], action: 'Search' },
  { keys: ['Ctrl', 'K'], action: 'Search (works while typing)' },
  { keys: ['v'], action: 'Edit variables' },
  { keys: ['['], action: 'Previous page' },
  { keys: [']'], action: 'Next page' },
  { keys: ['p'], action: 'Pin or unpin this page' },
  { keys: ['h'], action: 'Home' },
  { keys: ['?'], action: 'Show this list' },
]

export function ShortcutsDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange} size="sm" title="Keyboard shortcuts">
      <dl className="divide-y divide-teal-outline-variant/30">
        {SHORTCUTS.map((shortcut) => (
          <div key={shortcut.action} className="flex items-center justify-between gap-4 py-2.5 text-sm">
            <dt className="text-teal-on-surface">{shortcut.action}</dt>
            <dd className="flex shrink-0 gap-1">
              {shortcut.keys.map((key) => (
                <Key key={key}>{key}</Key>
              ))}
            </dd>
          </div>
        ))}
      </dl>
    </Dialog>
  )
}
