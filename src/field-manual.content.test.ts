import { describe, expect, it } from 'vitest'
import { content, tools } from './content-source'
import { commandChunk } from './lib/playbooks'

describe('field manual workflows', () => {
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
