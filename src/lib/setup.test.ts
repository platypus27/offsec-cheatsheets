import { describe, expect, it } from 'vitest'
import { parseSetup } from './setup'

const source = `
sections:
  - id: core
    title: Core tooling
    description: Base packages.
    items:
      - id: nmap
        title: Nmap
        description: Network scanner.
        destination: PATH
        command: sudo apt install -y nmap
        verify: nmap --version
`

describe('parseSetup', () => {
  it('parses a setup catalog', () => {
    const result = parseSetup(source)
    expect(result.errors).toEqual([])
    expect(result.sections[0]?.items[0]).toMatchObject({
      id: 'nmap',
      destination: 'PATH',
      command: 'sudo apt install -y nmap',
      verify: 'nmap --version',
    })
  })

  it('rejects duplicate ids, relative destinations and missing commands', () => {
    const result = parseSetup(`
sections:
  - id: core
    title: Core
    items:
      - { id: same, title: One, destination: tools/one, command: '', verify: one }
      - { id: same, title: Two, destination: /home/kali/tools/two, command: two, verify: two }
`)
    expect(result.sections).toEqual([])
    expect(result.errors).toEqual([
      'Section core, item 1: needs a non-empty command',
      'Section core, item 1: destination must be PATH or an absolute /home/kali/tools path',
      'Section core, item 2: duplicate item id "same"',
    ])
  })

  it('rejects malformed and empty catalogs', () => {
    expect(parseSetup('').errors).toEqual(['Setup needs at least one section'])
    expect(parseSetup('sections: nope').errors).toEqual(['Setup needs at least one section'])
  })
})
