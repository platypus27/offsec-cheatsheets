import { Binary, Crosshair, ScanSearch, Signpost } from 'lucide-react'

export const TOOL_LINKS = [
  { to: '/tools/targets', label: 'Targets', icon: Crosshair, keywords: 'targets hosts workspace active ip' },
  { to: '/tools/parse', label: 'Output parser', icon: ScanSearch, keywords: 'parser nmap paste ports suggest rules' },
  { to: '/tools/playbooks', label: 'Playbooks', icon: Signpost, keywords: 'playbooks decision tree wizard stuck' },
  { to: '/tools/encode', label: 'Encoders', icon: Binary, keywords: 'encode decode base64 url hex html powershell rot13' },
]
