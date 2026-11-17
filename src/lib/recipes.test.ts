import { describe, expect, it } from 'vitest'
import { buildContent } from './content'
import { parseRecipes } from './recipes'

const content = buildContent({
  'web/request.md':
    '## Replay\n\nRun on Kali.\n\n```bash\ncurl https://example.test\n```\n\n## Methodology\n\nRead the response.',
})
const valid = { ref: 'web/request#replay', tools: ['curl'], services: ['HTTP'], phase: 'Web testing' }

describe('command catalogue authoring boundary', () => {
  it('rejects a misspelled metadata field instead of silently hiding the group', () => {
    const result = parseRecipes(JSON.stringify([{ ...valid, servcies: ['DNS'] }]), content)
    expect(result.errors).toEqual([expect.stringContaining('servcies')])
    expect(result.recipes).toEqual([])
  })

  it('rejects dead headings, headings without commands and duplicate command groups', () => {
    const result = parseRecipes(
      JSON.stringify([
        valid,
        valid,
        { ...valid, ref: 'web/request#missing' },
        { ...valid, ref: 'web/request#methodology' },
      ]),
      content,
    )
    expect(result.recipes.map((recipe) => recipe.ref)).toEqual(['web/request#replay'])
    expect(result.errors).toHaveLength(3)
  })
})
