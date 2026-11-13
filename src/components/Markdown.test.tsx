import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { buildContent, parsePage } from '../lib/content'
import { isBooleanRecord, readJSON } from '../lib/storage'
import { renderApp } from '../test/render'
import { Markdown } from './Markdown'

const page = parsePage(
  'recon/scan.md',
  `## Full TCP scan

### Full TCP scan

## Weird \`code\` & *emphasis*!

- [ ] Check UDP
- [x] Save output

| Flag | Meaning |
| ---- | ------- |
| -sV  | Version |

[same page](#full-tcp-scan) [other page](../web/sqli.md#union) [sibling](udp) [external](https://example.com) [web section](web) [section slash](../web/) [diagram](./diagram.png)

> ## Full TCP scan

## Use <kbd>sudo</kbd> ![icon](x.png)
`,
)
const content = buildContent({ 'web/sqli.md': '## Union\n', 'recon/udp.md': 'x' })

describe('Markdown', () => {
  it('renders heading ids identical to the parsed (searchable) ids', () => {
    renderApp(<Markdown page={page} content={content} />)
    const ids = [...document.querySelectorAll('.prose-cheat > h2, .prose-cheat > h3')].map((element) => element.id)
    expect(ids).toEqual(page.headings.map((heading) => heading.id))
  })

  it('renders GFM tables', () => {
    renderApp(<Markdown page={page} content={content} />)
    expect(screen.getByRole('table')).toHaveTextContent('-sVVersion')
  })

  it('turns task lists into persistent checkboxes', async () => {
    const user = userEvent.setup()
    renderApp(<Markdown page={page} content={content} />)
    const udp = screen.getByRole('checkbox', { name: 'Check UDP' })
    expect(udp).not.toBeChecked()
    // [x] in the source is only the default; it still reflects saved state
    expect(screen.getByRole('checkbox', { name: 'Save output' })).toBeChecked()
    await user.click(udp)
    expect(udp).toBeChecked()
    expect(readJSON('checks', isBooleanRecord, {})).toMatchObject({ 'recon/scan::Check UDP::0': true })
  })

  it('keeps duplicate task labels independent and honours loose [x] items', async () => {
    const user = userEvent.setup()
    const tasks = parsePage('m/check.md', '## A\n\n- [ ] Run nmap\n\n## B\n\n- [ ] Run nmap\n\n- [x] loose\n\n- [ ] other\n')
    renderApp(<Markdown page={tasks} content={content} />)
    const [first, second] = screen.getAllByRole('checkbox', { name: 'Run nmap' })
    await user.click(first!)
    expect(first).toBeChecked()
    expect(second).not.toBeChecked()
    expect(screen.getByRole('checkbox', { name: 'loose' })).toBeChecked()
    expect(document.querySelector('label p, li.task-item p')).toBeNull()
  })

  it('rewrites links into in-app routes', () => {
    renderApp(<Markdown page={page} content={content} />)
    expect(screen.getByRole('link', { name: 'other page' })).toHaveAttribute('href', '/web/sqli?h=union')
    expect(screen.getByRole('link', { name: 'sibling' })).toHaveAttribute('href', '/recon/udp')
    expect(screen.getByRole('link', { name: 'same page' })).toHaveAttribute('href', '/recon/scan?h=full-tcp-scan')
    expect(screen.getByRole('link', { name: 'web section' })).toHaveAttribute('href', '/web')
    expect(screen.getByRole('link', { name: 'section slash' })).toHaveAttribute('href', '/web')
    expect(screen.getByRole('link', { name: /diagram/ })).toHaveAttribute('href', './diagram.png')
    const external = screen.getByRole('link', { name: /external/ })
    expect(external).toHaveAttribute('href', 'https://example.com')
    expect(external).toHaveAttribute('target', '_blank')
    expect(external).toHaveAttribute('rel', 'noreferrer')
  })
})
