import { describe, expect, it } from 'vitest'
import { buildContent, parsePage } from './content'

const sample = `---
title: Port Scanning
order: 2
tags: [nmap, tcp]
---

Intro paragraph before any heading.

## Full TCP scan

Scan every port first.

\`\`\`bash
nmap -p- -sV {{RHOST}}
\`\`\`

### Notes

- [ ] Run UDP top 100
- [x] Save output with \`-oA\`

## Full TCP scan

Duplicate heading text gets a suffixed slug.

#### Deep detail
`

describe('parsePage', () => {
  it('reads frontmatter and derives section and slug from the path', () => {
    const page = parsePage('recon/port-scanning.md', sample)
    expect(page.slug).toBe('recon/port-scanning')
    expect(page.section).toBe('recon')
    expect(page.title).toBe('Port Scanning')
    expect(page.order).toBe(2)
    expect(page.tags).toEqual(['nmap', 'tcp'])
    expect(page.body.startsWith('\nIntro paragraph')).toBe(true)
  })

  it('falls back to the first h1, then the file name, for the title', () => {
    expect(parsePage('web/a.md', '# From Heading\n\ntext').title).toBe('From Heading')
    expect(parsePage('web/sql-injection.md', 'text').title).toBe('Sql injection')
  })

  it('lists h2/h3 headings with github-style slugs that dedupe like rehype-slug', () => {
    const page = parsePage('recon/port-scanning.md', sample)
    expect(page.headings).toEqual([
      { id: 'full-tcp-scan', text: 'Full TCP scan', depth: 2 },
      { id: 'notes', text: 'Notes', depth: 3 },
      { id: 'full-tcp-scan-1', text: 'Full TCP scan', depth: 2 },
    ])
  })

  it('splits searchable chunks by heading, keeping prose and code apart', () => {
    const page = parsePage('recon/port-scanning.md', sample)
    expect(page.chunks.map((chunk) => chunk.headingId)).toEqual([
      null,
      'full-tcp-scan',
      'notes',
      'full-tcp-scan-1',
    ])
    const scan = page.chunks[1]!
    expect(scan.heading).toBe('Full TCP scan')
    expect(scan.text).toContain('Scan every port first.')
    expect(scan.code).toContain('nmap -p- -sV {{RHOST}}')
    expect(scan.text).not.toContain('nmap')
    expect(page.chunks[2]!.code).toContain('-oA')
    // h4 content folds into the enclosing h2 chunk
    expect(page.chunks[3]!.text).toContain('Deep detail')
  })

  it('slugs nested headings too, so ids match rehype-slug', () => {
    const page = parsePage('a/b.md', '> ## Notes\n\n## Notes\n')
    expect(page.headings).toEqual([{ id: 'notes-1', text: 'Notes', depth: 2 }])
  })

  it('slugs headings from their visible text, like rehype-slug', () => {
    const page = parsePage('a/b.md', '## Use <kbd>sudo</kbd>\n\n## Logo ![icon](x.png)\n')
    expect(page.headings.map((heading) => heading.id)).toEqual(['use-sudo', 'logo-'])
  })

  it('keeps chunk ids unique when a heading slugs to nothing', () => {
    const page = parsePage('a/b.md', 'Intro.\n\n## ???\n\nBody.\n')
    const ids = page.chunks.map((chunk) => chunk.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('lists tasks with stable unique keys and their source default', () => {
    const page = parsePage(
      'a/b.md',
      '## Linux\n\n- [ ] Run nmap\n- [x] Done already\n\n## Windows\n\n- [ ] Run nmap\n\n- [x] loose one\n\n- [ ] loose two\n',
    )
    expect(page.tasks.map(({ key, defaultChecked }) => [key, defaultChecked])).toEqual([
      ['a/b::Run nmap::0', false],
      ['a/b::Done already::0', true],
      ['a/b::Run nmap::1', false],
      ['a/b::loose one::0', true],
      ['a/b::loose two::0', false],
    ])
    expect(new Set(page.tasks.map((task) => task.line)).size).toBe(5)
  })

  it('rejects malformed frontmatter values instead of trusting them', () => {
    const page = parsePage('x/y.md', '---\ntitle: 5\norder: soon\ntags: nope\n---\nbody')
    expect(page.title).toBe('Y')
    expect(page.order).toBe(Number.MAX_SAFE_INTEGER)
    expect(page.tags).toEqual([])
  })
})

describe('buildContent', () => {
  const files = {
    'web/_meta.yaml': 'title: Web Attacks\norder: 2',
    'web/b.md': '---\ntitle: B\norder: 2\n---\n',
    'web/a.md': '---\ntitle: A\norder: 1\n---\n',
    'recon/_meta.yaml': 'title: Recon\norder: 1',
    'recon/z.md': '---\ntitle: Z\n---\n',
    'misc-notes/c.md': '---\ntitle: C\n---\n',
  }

  it('orders sections and pages by order then title, using _meta.yaml titles', () => {
    const content = buildContent(files)
    expect(content.sections.map((section) => section.title)).toEqual(['Recon', 'Web Attacks', 'Misc notes'])
    expect(content.sections[1]!.pages.map((page) => page.title)).toEqual(['A', 'B'])
  })

  it('links pages into one prev/next reading order across sections', () => {
    const content = buildContent(files)
    expect(content.pages.map((page) => page.slug)).toEqual(['recon/z', 'web/a', 'web/b', 'misc-notes/c'])
    expect(content.neighbours('web/a')).toEqual({
      prev: content.page('recon/z'),
      next: content.page('web/b'),
    })
    expect(content.neighbours('recon/z').prev).toBeUndefined()
    expect(content.page('nope/missing')).toBeUndefined()
  })

  it('skips the reserved tools section and underscored data folders', () => {
    const content = buildContent({ 'tools/a.md': 'x', '_playbooks/b.md': 'y', 'ok/c.md': 'z' })
    expect(content.pages.map((page) => page.slug)).toEqual(['ok/c'])
  })

  it('ignores files nested deeper than section/page', () => {
    const content = buildContent({ 'a/b/c.md': 'x', 'top.md': 'y' })
    expect(content.pages).toEqual([])
  })
})
