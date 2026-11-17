import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative, sep } from 'node:path'
import { describe, expect, it } from 'vitest'
import { buildContent } from './lib/content'
import { findBrokenLinks } from './lib/linkcheck'
import { buildTools } from './tools-source'

// Checks the real notes (and the e2e fixtures): a broken link, rule or
// playbook fails the test run instead of surfacing mid-exam.
function readTree(root: string): Record<string, string> {
  const files: Record<string, string> = {}
  const walk = (dir: string) => {
    for (const name of readdirSync(dir)) {
      const path = join(dir, name)
      if (statSync(path).isDirectory()) walk(path)
      else files[relative(root, path).split(sep).join('/')] = readFileSync(path, 'utf8')
    }
  }
  walk(root)
  return files
}

for (const root of ['content', 'e2e/fixtures/content']) {
  describe(`content in ${root}`, () => {
    const files = readTree(root)
    const content = buildContent(files)
    const playbooks = Object.fromEntries(
      Object.entries(files).filter(([path]) => /^_playbooks\/[^/]+\.ya?ml$/.test(path)),
    )
    const tools = buildTools(
      files['_rules.yaml'] ?? '',
      playbooks,
      content,
      files['_setup.yaml'] ?? '',
      files['_recipes.yaml'] ?? '',
    )

    it('has pages', () => {
      expect(content.pages.length).toBeGreaterThan(0)
    })

    it('has no broken links', () => {
      expect(findBrokenLinks(content)).toEqual([])
    })

    it('has valid rules and playbooks', () => {
      expect(tools.problems).toEqual([])
    })

    it('has no shared listener port placeholders', () => {
      expect(Object.values(files).join('\n')).not.toMatch(/\{\{\s*LPORT\s*\}\}/)
    })
  })
}
