import { describe, expect, it } from 'vitest'
import { content, tools } from './content-source'
import { commandChunk } from './lib/playbooks'
import { createSearch } from './lib/search'

describe('field manual workflows', () => {
  it('finds exam packaging requirements by what the candidate needs to do', () => {
    const results = createSearch(content)('report archive upload checksum')
    expect(results.slice(0, 5)).toContainEqual(
      expect.objectContaining({ pageSlug: 'reporting/report', headingId: 'package-and-upload' }),
    )
  })

  it('targets the CA host explicitly for every ESC7 management action', () => {
    const commands = commandChunk('active-directory/attack-paths#esc7-ca-management', content)!
      .code.split('\n')
      .filter((line) => line.startsWith('certipy ca '))
    expect(commands.length).toBeGreaterThan(0)
    for (const command of commands) expect(command).toContain("-target '{{CA_HOST}}'")
  })
  it('provides the build and fixed staging path for the Windows ticket tool', () => {
    const setup = tools.setup.flatMap((section) => section.items)
    expect(setup.find((item) => item.id === 'rubeus-binary')?.destination).toBe(
      '/home/kali/tools/binaries/Rubeus.exe',
    )
    expect(commandChunk('active-directory/tool-preparation#windows-release-build', content)?.code).toContain(
      'msbuild.exe',
    )
  })
  it('keeps John extractor output on a matching cracker path', () => {
    const password = tools.playbooks.find((item) => item.id === 'passwords')!
    expect(password.nodes.extract?.options).toContainEqual({
      label: 'John-compatible material extracted',
      next: 'john',
    })
    expect(password.nodes.john?.commands).toContain('passwords/cracking#john-dictionary-job')
  })
  it('finds cross-protocol command groups using their actual service context', () => {
    const matching = (tool: string, service: string) =>
      tools.recipes
        .filter((recipe) => recipe.tools.includes(tool) && recipe.services.includes(service))
        .map((recipe) => recipe.ref)
    expect(matching('dig', 'DNS')).toContain('active-directory/ad-enumeration#identify-domain-and-dc')
    expect(matching('Hydra', 'HTTP')).toContain('passwords/online#http-form-validation')
  })
  it('makes password recovery and exploit assessment actionable through companions', () => {
    for (const id of ['passwords', 'exploit-assessment']) {
      const playbook = tools.playbooks.find((item) => item.id === id)
      expect(playbook, id).toBeDefined()
      const refs = Object.values(playbook!.nodes).flatMap((node) => node.commands)
      expect(refs.length, id).toBeGreaterThan(0)
      for (const ref of refs) expect(commandChunk(ref, content)?.blocks.length, ref).toBeGreaterThan(0)
    }
  })
})
