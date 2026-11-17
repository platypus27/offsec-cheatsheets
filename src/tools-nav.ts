import { Binary, BookOpen, NotebookPen, ScanSearch, Signpost, Terminal, Wrench } from 'lucide-react'

export const WORKFLOW_LINKS = [
  {
    to: '/field-guide/start',
    label: 'Field manual',
    icon: BookOpen,
    keywords: 'field manual task workflow index methodology coverage troubleshooting',
  },
  {
    to: '/tools/commands',
    label: 'Command explorer',
    icon: Terminal,
    keywords: 'commands tools services techniques recipes lookup',
  },
  {
    to: '/tools/notebook',
    label: 'Lab notebook',
    icon: NotebookPen,
    keywords: 'lab tracker notes progress evidence findings export',
  },
  { to: '/setup', label: 'Setup', icon: Wrench, keywords: 'setup install kali tools node wordlists' },
  {
    to: '/companions',
    label: 'Companions',
    icon: Signpost,
    keywords: 'companions playbooks decision tree wizard guide stuck',
  },
]

export const UTILITY_LINKS = [
  {
    to: '/tools/parse',
    label: 'Scan parser',
    icon: ScanSearch,
    keywords: 'parser nmap paste ports suggest rules output',
  },
  {
    to: '/tools/encode',
    label: 'Encoders',
    icon: Binary,
    keywords: 'encode decode base64 url hex html powershell rot13',
  },
]

export const TOOL_LINKS = [...WORKFLOW_LINKS, ...UTILITY_LINKS]
