import { act, screen, waitFor } from '@testing-library/react'
import Prism from 'prismjs'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { writeJSON } from '../lib/storage'
import { renderApp } from '../test/render'
import { useAppState } from '../state'
import { CodeBlock } from './CodeBlock'

describe('CodeBlock', () => {
  it('shows and copies the command with variables filled in', async () => {
    writeJSON('variables', { RHOST: '10.1.1.5' })
    const user = userEvent.setup()
    const writeText = vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue()
    renderApp(<CodeBlock code={'nmap -sV {{RHOST}} -p {{RPORT}}\n'} language="bash" />)

    const region = screen.getByRole('region', { name: 'bash code' })
    expect(region).toHaveTextContent('nmap -sV 10.1.1.5 -p {{RPORT}}')
    expect(region.querySelector('.var-unset')).toHaveTextContent('{{RPORT}}')

    await user.click(screen.getByRole('button', { name: 'Copy code' }))
    expect(writeText).toHaveBeenCalledWith('nmap -sV 10.1.1.5 -p {{RPORT}}')
    expect(await screen.findByText('Copied to clipboard')).toBeInTheDocument()
  })

  it('reports a failed copy instead of pretending it worked', async () => {
    const user = userEvent.setup()
    vi.spyOn(navigator.clipboard, 'writeText').mockRejectedValue(new Error('denied'))
    renderApp(<CodeBlock code="id" language="bash" />)
    await user.click(screen.getByRole('button', { name: 'Copy code' }))
    expect(await screen.findByText('Could not copy - select the text and copy manually')).toBeInTheDocument()
    await waitFor(() => expect(screen.getByRole('button', { name: 'Copy code' })).toBeInTheDocument())
  })

  it('re-highlights only when the code changes, not on every variable keystroke', () => {
    const highlight = vi.spyOn(Prism, 'highlight')
    let setVariable: (name: string, value: string) => void = () => {}
    function Grab() {
      setVariable = useAppState().setVariable
      return null
    }
    renderApp(
      <>
        <Grab />
        <CodeBlock code="ping {{RHOST}}" language="bash" />
      </>,
    )
    const calls = highlight.mock.calls.length
    act(() => setVariable('RHOST', '10.0.0.1'))
    act(() => setVariable('RHOST', '10.0.0.12'))
    expect(highlight.mock.calls.length).toBe(calls)
    expect(screen.getByRole('region', { name: 'bash code' })).toHaveTextContent('ping 10.0.0.12')
  })

  it('escapes HTML in languages without a grammar', () => {
    renderApp(<CodeBlock code="<script>alert(1)</script>" language="nope" />)
    expect(screen.getByRole('region', { name: 'nope code' })).toHaveTextContent('<script>alert(1)</script>')
    expect(document.querySelector('script')).toBeNull()
  })
})
