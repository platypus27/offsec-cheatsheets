import type { Definition, Link as MdLink } from 'mdast'
import { visit } from 'unist-util-visit'
import { parseMarkdown, type Content } from './content'
import { resolveLink } from './links'

/** Every in-app Markdown link that points at a missing page, section or heading. */
export function findBrokenLinks(content: Content): string[] {
  const problems: string[] = []
  for (const page of content.pages) {
    // Reference-style links render as live links via their definition, so check those too.
    visit(parseMarkdown(page.body), ['link', 'definition'], (node) => {
      if (node.type !== 'link' && node.type !== 'definition') return
      check(node)
    })
    function check(node: MdLink | Definition) {
      const link = resolveLink(node.url, page.slug, content)
      if (link.kind !== 'internal') return
      const url = new URL(link.to, 'http://app')
      const [section = '', name] = url.pathname.slice(1).split('/')
      const heading = url.searchParams.get('h')
      const target = name ? content.page(`${section}/${name}`) : undefined
      const where = `${page.slug}.md: link "${node.url}"`
      if (!name) {
        if (!content.section(section)) problems.push(`${where} points at a missing section`)
      } else if (!target) problems.push(`${where} points at a missing page`)
      else if (heading && !target.headings.some((item) => item.id === heading))
        problems.push(`${where} points at a missing heading`)
    }
  }
  return problems
}
