import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { buildContent } from '../lib/content'
import { writeJSON } from '../lib/storage'
import { renderApp } from '../test/render'
import { Route, Routes } from 'react-router'
import { CheatPage } from './CheatPage'

const content = buildContent({
  'a/_meta.yaml': 'title: A',
  'a/list.md': '## Tasks\n\n- [ ] One\n- [x] Two\n- [ ] Three\n\n## Other\n\ntext\n',
})

function renderPage() {
  return renderApp(
    <Routes>
      <Route path=":section/:page" element={<CheatPage content={content} />} />
    </Routes>,
    { route: '/a/list' },
  )
}

describe('CheatPage', () => {
  it('counts progress from the tasks on the page, ignoring stale keys', () => {
    writeJSON('checks', { 'a/list::One::0': true, 'a/list::Renamed away::0': true })
    renderPage()
    expect(screen.getByText('2 / 3 done')).toBeInTheDocument()
  })

  it('links on-this-page entries to router locations', () => {
    renderPage()
    const nav = screen.getByRole('navigation', { name: 'On this page' })
    expect(nav.querySelector('a[href="/a/list?h=other"]')).not.toBeNull()
  })
})
