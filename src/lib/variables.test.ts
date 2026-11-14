import { describe, expect, it } from 'vitest'
import { DEFAULT_VARIABLES, findPlaceholders, substitute } from './variables'

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

describe('DEFAULT_VARIABLES', () => {
  it('keeps a single LHOST and one variable per lab machine', () => {
    const names = DEFAULT_VARIABLES.map((variable) => variable.name)
    expect(names.filter((name) => name === 'LHOST')).toHaveLength(1)
    expect(names).toEqual(expect.arrayContaining(['MS01', 'MS02', 'DC01']))
    expect(names).not.toContain('DC')
  })
})
