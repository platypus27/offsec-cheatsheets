import { describe, expect, it } from 'vitest'
import { buildContent } from './content'
import { parsePlaybook, validatePlaybookLinks, walk } from './playbooks'

const source = `
title: Foothold
description: When nothing works.
start: begin
nodes:
  begin:
    prompt: Scanned every TCP port?
    options:
      - { label: 'Yes', next: web }
      - { label: 'No', next: scan }
  scan:
    prompt: Run a full scan.
    links: [recon/scanning#port-scanning]
    options:
      - { label: Done, next: begin }
  web:
    prompt: Web enumeration
    body: Check the content discovery notes.
    links: [web/web-enumeration]
`

describe('parsePlaybook', () => {
  it('parses a valid playbook', () => {
    const { playbook, errors } = parsePlaybook('foothold', source)
    expect(errors).toEqual([])
    expect(playbook).toMatchObject({ id: 'foothold', title: 'Foothold', start: 'begin' })
    expect(playbook!.nodes.web).toMatchObject({ body: 'Check the content discovery notes.', options: [] })
  })

  it('reports broken structure', () => {
    const { playbook, errors } = parsePlaybook(
      'broken',
      `
title: Broken
start: nowhere
nodes:
  a:
    prompt: A
    options:
      - { label: Go, next: missing }
      - { next: a }
  orphan:
    prompt: Never reached
`,
    )
    expect(playbook).toBeUndefined()
    expect(errors).toEqual([
      'Start node "nowhere" does not exist',
      'Node a, option 1: next node "missing" does not exist',
      'Node a, option 2: needs a label',
    ])
    expect(
      parsePlaybook('x', 'title: X\nstart: a\nnodes:\n  a: { prompt: A }\n  b: { prompt: B }').errors,
    ).toEqual(['Node b is unreachable from the start node'])
    expect(parsePlaybook('x', '[]').errors).toEqual(['A playbook needs "title", "start" and "nodes"'])
  })

  it('does not treat Object.prototype names as nodes', () => {
    expect(parsePlaybook('x', 'title: X\nstart: toString\nnodes:\n  a: { prompt: A }').errors).toEqual([
      'Start node "toString" does not exist',
    ])
    expect(
      parsePlaybook(
        'x',
        'title: X\nstart: a\nnodes:\n  a:\n    prompt: A\n    options:\n      - { label: Go, next: constructor }',
      ).errors,
    ).toEqual(['Node a, option 1: next node "constructor" does not exist'])
  })

  it('rejects node ids that cannot be stored in the URL path', () => {
    expect(
      parsePlaybook(
        'x',
        'title: X\nstart: a\nnodes:\n  a:\n    options: [{ label: Go, next: smb.null }]\n  smb.null: { prompt: B }',
      ).errors,
    ).toEqual(['Node id "smb.null" may only use letters, digits, "-" and "_"'])
  })
})

describe('walk', () => {
  const { playbook } = parsePlaybook('foothold', source)

  it('follows a valid path, allowing loops', () => {
    expect(walk(playbook!, ['begin', 'scan', 'begin', 'web'])).toEqual(['begin', 'scan', 'begin', 'web'])
  })

  it('truncates at the first invalid step and always starts at the start node', () => {
    expect(walk(playbook!, ['begin', 'web', 'scan'])).toEqual(['begin', 'web'])
    expect(walk(playbook!, ['scan'])).toEqual(['begin'])
    expect(walk(playbook!, [])).toEqual(['begin'])
  })
})

describe('validatePlaybookLinks', () => {
  it('flags links to missing pages or headings', () => {
    const { playbook } = parsePlaybook('foothold', source)
    const content = buildContent({
      'recon/scanning.md': '## Host discovery\n',
      'web/web-enumeration.md': 'x',
    })
    expect(validatePlaybookLinks(playbook!, content)).toEqual([
      'Playbook foothold, node scan: "recon/scanning#port-scanning" has no such heading',
    ])
  })
})
