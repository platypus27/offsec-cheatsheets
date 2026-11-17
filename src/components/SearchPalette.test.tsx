import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { buildContent } from '../lib/content'
import { writeJSON } from '../lib/storage'
import { renderApp } from '../test/render'
import { SearchPalette } from './SearchPalette'
import { buildTools } from '../tools-source'

const content = buildContent({
  'recon/_meta.yaml': 'title: Recon',
  'recon/scan.md': '---\ntitle: Scanning\n---\n## Service detection\n\n```bash\nnmap -sV {{RHOST}}\n```\n',
  'web/sqli.md': '---\ntitle: SQL Injection\n---\n## Union based\n\nOrder by to count columns.\n',
})

const tools = buildTools(
  '',
  { 'x/stuck.yaml': 'title: Stuck on foothold\nstart: a\nnodes:\n  a: { phase: Discovery, prompt: A }\n' },
  content,
)

describe('SearchPalette', () => {
  it('lists matching tools and companions first', async () => {
    const user = userEvent.setup()
    renderApp(<SearchPalette content={content} tools={tools} open onOpenChange={() => {}} />)
    await user.keyboard('stuck')
    const option = await screen.findByRole('option', { name: /Stuck on foothold/ })
    expect(option).toHaveTextContent('Companions')
    await user.keyboard('{Enter}')
    expect(screen.getByTestId('location')).toHaveTextContent('/companions/stuck')
  })

  it('searches as you type and opens the exact heading on Enter', async () => {
    const user = userEvent.setup()
    renderApp(<SearchPalette content={content} tools={tools} open onOpenChange={() => {}} />)
    await user.keyboard('union')
    const option = await screen.findByRole('option', { name: /Union based/ })
    expect(option).toHaveTextContent('Union basedWeb / SQL InjectionOrder by to count columns.')
    await user.keyboard('{Enter}')
    expect(screen.getByTestId('location')).toHaveTextContent('/web/sqli?h=union-based')
  })

  it('shows an empty state for unmatched queries', async () => {
    const user = userEvent.setup()
    renderApp(<SearchPalette content={content} tools={tools} open onOpenChange={() => {}} />)
    await user.keyboard('qqqqzzzz')
    expect(await screen.findByText(/No results for/)).toBeInTheDocument()
  })

  it('lists recently opened pages before typing', () => {
    // Visits are recorded by CheatPage; the palette only reads them.
    writeJSON('recents', ['recon/scan', 'gone/page'])
    renderApp(<SearchPalette content={content} tools={tools} open onOpenChange={() => {}} />)
    expect(screen.getByText('Recent')).toBeInTheDocument()
    expect(screen.getAllByRole('option')).toHaveLength(1)
    expect(screen.getByRole('option', { name: /Scanning/ })).toBeInTheDocument()
  })
})
