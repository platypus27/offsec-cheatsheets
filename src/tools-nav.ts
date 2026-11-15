import { Binary, ScanSearch, Signpost, Wrench } from 'lucide-react'

export const WORKFLOW_LINKS = [
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
