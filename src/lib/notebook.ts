import { isRecord } from './guards'

export const LAB_STATUSES = ['discovery', 'foothold', 'privileged', 'documented'] as const
export type LabStatus = (typeof LAB_STATUSES)[number]
export const NOTE_FIELDS = ['entry', 'privilege', 'evidence', 'next', 'notes'] as const
export interface LabNote {
  status: LabStatus
  entry: string
  privilege: string
  evidence: string
  next: string
  notes: string
}
export interface Notebook {
  version: 1
  items: Record<string, LabNote>
}

export const notebookKey = (profileId: string, address: string) => JSON.stringify([profileId, address.trim()])
export const emptyLabNote = (): LabNote => ({
  status: 'discovery',
  entry: '',
  privilege: '',
  evidence: '',
  next: '',
  notes: '',
})
export function isNotebook(value: unknown): value is Notebook {
  return (
    isRecord(value) &&
    value.version === 1 &&
    isRecord(value.items) &&
    Object.values(value.items).every(
      (note) =>
        isRecord(note) &&
        LAB_STATUSES.some((status) => status === note.status) &&
        NOTE_FIELDS.every((field) => typeof note[field] === 'string'),
    )
  )
}

export function exportLabNote(name: string, address: string, note: LabNote): string {
  const title = name.replace(/[\r\n]/g, ' ')
  return (
    `# ${title}\n\nTarget: ${address.replace(/[\r\n]/g, ' ') || 'Not set'}\nStatus: ${note.status}\n\n` +
    [
      ['Entry point', note.entry],
      ['Privilege path', note.privilege],
      ['Evidence', note.evidence],
      ['Next action', note.next],
      ['Working notes', note.notes],
    ]
      .map(([heading, text]) => `## ${heading}\n\n${text || 'Not recorded'}\n`)
      .join('\n')
  )
}
