import { describe, expect, it } from 'vitest'
import { buildContent } from './content'
import { createSearch } from './search'

const content = buildContent({
  'recon/_meta.yaml': 'title: Recon\norder: 1',
  'recon/scanning.md': `---
title: Scanning
tags: [nmap]
---
## Service detection

Use version detection on open ports.

\`\`\`bash
nmap -sV -sC -p {{PORTS}} {{RHOST}}
\`\`\`
`,
  'web/_meta.yaml': 'title: Web\norder: 2',
  'web/uploads.md': `---
title: File Uploads
---
## Extension bypass

Mention of service detection in passing, deep in body prose about uploads.

## Content-Type tricks

Change the content-type header.
`,
})

describe('createSearch', () => {
  const search = createSearch(content)

  it('ranks a heading match above a body-only match', () => {
    const results = search('service detection')
    expect(results[0]).toMatchObject({
      pageSlug: 'recon/scanning',
      headingId: 'service-detection',
      sectionTitle: 'Recon',
    })
    expect(results.map((result) => result.headingId)).toContain('extension-bypass')
  })

  it('finds command flags and code content', () => {
    expect(search('-sV')[0]).toMatchObject({ headingId: 'service-detection' })
    expect(search('nmap -sC')[0]).toMatchObject({ headingId: 'service-detection' })
  })

  it('matches hyphenated terms and prefixes', () => {
    expect(search('content-type')[0]).toMatchObject({ headingId: 'content-type-tricks' })
    expect(search('uplo')[0]).toMatchObject({ pageSlug: 'web/uploads' })
  })

  it('tolerates small typos', () => {
    expect(search('detcetion').length).toBeGreaterThan(0)
  })

  it('falls back to any-term matching when no chunk has every term', () => {
    expect(search('nmap zzzunrelated')[0]).toMatchObject({ pageSlug: 'recon/scanning' })
  })

  it('cuts snippets on word boundaries', () => {
    const snippet = search('header')[0]!.snippet
    expect(snippet).toBe('Change the content-type header.')
    const long = createSearch(
      buildContent({ 'a/b.md': `## H\n\n${'alpha '.repeat(30)}needle ${'omega '.repeat(40)}` }),
    )('needle')[0]!.snippet
    expect(long).toMatch(/^…alpha /)
    expect(long).toMatch(/ omega…$/)
  })

  it('returns a snippet around the match and nothing for blank queries', () => {
    expect(search('version')[0]!.snippet).toContain('version detection')
    expect(search('   ')).toEqual([])
  })
})
