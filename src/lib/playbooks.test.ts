import { describe, expect, it } from 'vitest'
import { buildContent } from './content'
import { parsePlaybook, recommendedServices, validatePlaybookLinks, walk } from './playbooks'

const source = `
title: Foothold
description: When nothing works.
start: begin
nodes:
  begin:
    phase: Discovery
    prompt: Scanned every TCP port?
    options:
      - { label: 'Yes', next: web }
      - { label: 'No', next: scan }
  scan:
    phase: Discovery
    prompt: Run a full scan.
    links: [recon/scanning#port-scanning]
    options:
      - { label: Done, next: begin }
  web:
    phase: Discovery
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

  it('parses contextual help and recommends matching open services', () => {
    const { playbook, errors } = parsePlaybook(
      'ad',
      `
title: AD
start: services
nodes:
  services:
    phase: Enumeration
    prompt: What is open?
    why: Confirm the service before enumerating it.
    lookFor: Accessible shares and valid listeners.
    record: Save the service evidence.
    services:
      - id: smb
        title: SMB
        match: { ports: [445], services: [microsoft-ds] }
        commands: [recon/scanning#port-scanning]
      - id: ldap
        title: LDAP
        match: { ports: [389] }
        commands: [recon/scanning#port-scanning]
`,
    )
    expect(errors).toEqual([])
    expect(playbook!.nodes.services).toMatchObject({
      phase: 'Enumeration',
      why: 'Confirm the service before enumerating it.',
    })
    const ports = [
      { port: 445, protocol: 'tcp' as const, state: 'open', service: 'microsoft-ds', version: '' },
      { port: 389, protocol: 'tcp' as const, state: 'closed', service: 'ldap', version: '' },
    ]
    expect(recommendedServices(playbook!.nodes.services!, ports)).toEqual(['smb'])
  })

  it('requires a phase', () => {
    const { errors } = parsePlaybook('x', 'title: X\nstart: a\nnodes:\n  a: { prompt: A }')
    expect(errors).toContain('Node a: needs a phase')
  })

  it('reports broken structure', () => {
    const { playbook, errors } = parsePlaybook(
      'broken',
      `
title: Broken
start: nowhere
nodes:
  a:
    phase: Discovery
    prompt: A
    options:
      - { label: Go, next: missing }
      - { next: a }
  orphan:
    phase: Discovery
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
      parsePlaybook(
        'x',
        'title: X\nstart: a\nnodes:\n  a: { phase: Discovery, prompt: A }\n  b: { phase: Discovery, prompt: B }',
      ).errors,
    ).toEqual(['Node b is unreachable from the start node'])
    expect(parsePlaybook('x', '[]').errors).toEqual(['A playbook needs "title", "start" and "nodes"'])
  })

  it('does not treat Object.prototype names as nodes', () => {
    expect(
      parsePlaybook('x', 'title: X\nstart: toString\nnodes:\n  a: { phase: Discovery, prompt: A }').errors,
    ).toEqual(['Start node "toString" does not exist'])
    expect(
      parsePlaybook(
        'x',
        'title: X\nstart: a\nnodes:\n  a:\n    phase: Discovery\n    prompt: A\n    options:\n      - { label: Go, next: constructor }',
      ).errors,
    ).toEqual(['Node a, option 1: next node "constructor" does not exist'])
  })

  it('rejects node ids that cannot be stored in the URL path', () => {
    expect(
      parsePlaybook(
        'x',
        'title: X\nstart: a\nnodes:\n  a:\n    phase: Discovery\n    options: [{ label: Go, next: smb.null }]\n  smb.null: { phase: Discovery, prompt: B }',
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
