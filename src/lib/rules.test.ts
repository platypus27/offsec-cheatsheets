import { describe, expect, it } from 'vitest'
import { buildContent } from './content'
import type { ScannedPort } from './nmap'
import { parseRules, suggest, validateRules } from './rules'

const yaml = `
- id: smb
  title: SMB
  match:
    ports: [139, 445]
    services: [microsoft-ds, netbios]
  suggest: [services/common-services#smb]
  note: Try a null session first.
- id: web
  title: Web server
  match:
    services: [http]
    versions: ['apache\\s+2\\.4']
  suggest: [web/web-enumeration]
- id: old-apache
  title: Old Apache
  match:
    versions: ['Apache httpd 2\\.4\\.(?:[0-9]|[1-3][0-9]|4[0-8])\\b']
  suggest: [web/web-enumeration#technology-fingerprinting]
`

const port = (number: number, service: string, version = '', state = 'open'): ScannedPort => ({
  port: number,
  protocol: 'tcp',
  state,
  service,
  version,
})

describe('parseRules', () => {
  it('parses valid rules', () => {
    const { rules, errors } = parseRules(yaml)
    expect(errors).toEqual([])
    expect(rules.map((rule) => rule.id)).toEqual(['smb', 'web', 'old-apache'])
  })

  it('reports malformed rules with their position instead of throwing', () => {
    const { rules, errors } = parseRules(`
- id: ok
  title: OK
  match: { ports: [21] }
  suggest: [a/b]
- title: missing id
  match: { ports: [22] }
  suggest: [a/b]
- id: bad-regex
  title: Bad
  match: { versions: ['(unclosed'] }
  suggest: [a/b]
- id: empty-match
  title: Empty
  match: {}
  suggest: [a/b]
- id: ok
  title: Duplicate
  match: { ports: [23] }
  suggest: [a/b]
`)
    expect(rules.map((rule) => rule.title)).toEqual(['OK'])
    expect(errors).toEqual([
      'Rule 2: needs an "id" made of letters, digits and dashes',
      'Rule 3 (bad-regex): invalid version pattern "(unclosed"',
      'Rule 4 (empty-match): "match" needs at least one of ports, services or versions',
      'Rule 5 (ok): duplicate id',
    ])
    expect(parseRules('not: [a list').errors[0]).toMatch(/^Could not read rules YAML/)
    expect(parseRules('').errors).toEqual([])
  })
})

describe('suggest', () => {
  const { rules } = parseRules(yaml)

  it('matches open ports by number, service or version and groups ports per rule', () => {
    const results = suggest(
      [
        port(80, 'http', 'Apache httpd 2.4.41 ((Ubuntu))'),
        port(139, 'netbios-ssn', '', 'filtered'),
        port(445, 'microsoft-ds?'),
        port(8080, 'http-proxy'),
      ],
      rules,
    )
    expect(results.map((result) => [result.rule.id, result.ports.map((item) => item.port)])).toEqual([
      ['web', [80, 8080]],
      ['old-apache', [80]],
      ['smb', [445]],
    ])
  })

  it('returns nothing when no open port matches', () => {
    expect(suggest([port(3389, 'ms-wbt-server')], rules)).toEqual([])
  })
})

describe('validateRules', () => {
  it('flags suggestions pointing at missing pages or headings', () => {
    const content = buildContent({
      'services/common-services.md': '## SMB\n',
      'web/web-enumeration.md': '## Content discovery\n',
    })
    expect(validateRules(parseRules(yaml).rules, content)).toEqual([
      'Rule old-apache: "web/web-enumeration#technology-fingerprinting" has no such heading',
    ])
  })
})
