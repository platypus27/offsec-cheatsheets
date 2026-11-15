import { describe, expect, it } from 'vitest'
import { SHARED_VARIABLES, findPlaceholders, substitute } from './variables'

describe('substitute', () => {
  it('replaces set placeholders and leaves unset ones visible', () => {
    expect(
      substitute('nc {{ RHOST }} {{LPORT}} {{LHOST}}', { RHOST: '10.0.0.5', LPORT: '', LHOST: '  ' }),
    ).toBe('nc 10.0.0.5 {{LPORT}} {{LHOST}}')
  })

  it('does not reinterpret replacement patterns inside values', () => {
    expect(substitute('echo {{PASS}}', { PASS: 'a$&b$1' })).toBe('echo a$&b$1')
  })

  it('ignores lowercase or malformed braces', () => {
    expect(substitute('{{rhost}} {{ }} {RHOST}', { RHOST: 'x', rhost: 'y' })).toBe('{{rhost}} {{ }} {RHOST}')
  })
})

describe('findPlaceholders', () => {
  it('lists unique placeholder names in first-seen order', () => {
    expect(findPlaceholders('{{B}} {{A}} {{ B }}')).toEqual(['B', 'A'])
  })
})

describe('SHARED_VARIABLES', () => {
  it('uses friendly labels for the two shared attacker values', () => {
    expect(SHARED_VARIABLES.map((variable) => variable.name)).toEqual(['LHOST', 'LPORT'])
    expect(SHARED_VARIABLES.map((variable) => variable.label)).toEqual(['My IP', 'My port'])
  })
})
