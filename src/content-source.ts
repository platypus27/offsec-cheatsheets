import { buildContent } from './lib/content'
import { buildTools } from './tools-source'

// `@content` resolves to ./content, or to CHEATSHEET_CONTENT when set (the e2e
// suite builds against fixed fixtures). Files are inlined at build time.
const modules = import.meta.glob<string>(['@content/*/*.md', '@content/*/_meta.yaml'], {
  query: '?raw',
  import: 'default',
  eager: true,
})

const files = Object.fromEntries(
  Object.entries(modules).map(([path, raw]) => [path.split('/').slice(-2).join('/'), raw]),
)

export const content = buildContent(files)

const ruleFiles = import.meta.glob<string>('@content/_rules.yaml', { query: '?raw', import: 'default', eager: true })
const playbookFiles = import.meta.glob<string>('@content/_playbooks/*.{yaml,yml}', {
  query: '?raw',
  import: 'default',
  eager: true,
})

export const tools = buildTools(Object.values(ruleFiles)[0] ?? '', playbookFiles, content)
