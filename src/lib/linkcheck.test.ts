import { describe, expect, it } from 'vitest'
import { buildContent } from './content'
import { findBrokenLinks } from './linkcheck'

describe('findBrokenLinks', () => {
  it('reports internal links to missing pages, sections and headings only', () => {
    const content = buildContent({
      'a/one.md':
        '## Real\n\n[ok](#real) [bad heading](#nope) [ok page](two) [bad page](zzz) [ok section](b/) [bad section](nowhere/) [ext](https://x.y) [img](./x.png)',
      'a/two.md': 'x',
      'b/three.md': 'y',
    })
    expect(findBrokenLinks(content)).toEqual([
      'a/one.md: link "#nope" points at a missing heading',
      'a/one.md: link "zzz" points at a missing page',
      'a/one.md: link "nowhere/" points at a missing section',
    ])
  })

  it('checks reference-style link definitions too', () => {
    const content = buildContent({
      'a/one.md': '[ok][good] [bad][gone]\n\n[good]: two\n[gone]: ../b/missing.md#x',
      'a/two.md': 'x',
    })
    expect(findBrokenLinks(content)).toEqual(['a/one.md: link "../b/missing.md#x" points at a missing page'])
  })
})
