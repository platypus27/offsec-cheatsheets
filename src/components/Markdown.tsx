import { Children, Fragment, isValidElement, memo, useMemo, type ReactElement, type ReactNode } from 'react'
import { ExternalLink } from 'lucide-react'
import { Checkbox } from '@kryv/teal'
import type { Element, ElementContent } from 'hast'
import ReactMarkdown, { type Components } from 'react-markdown'
import { Link } from 'react-router'
import rehypeSlug from 'rehype-slug'
import remarkGfm from 'remark-gfm'
import type { Content, Page, Task } from '../lib/content'
import { resolveLink } from '../lib/links'
import { useAppState } from '../state'
import { CodeBlock } from './CodeBlock'

function hastText(node: ElementContent | Element): string {
  if (node.type === 'text') return node.value
  if (node.type === 'element') return node.children.map(hastText).join('')
  return ''
}

const isList = (child: ReactNode): child is ReactElement =>
  isValidElement(child) && (child.type === 'ul' || child.type === 'ol')

/**
 * Loose task items (blank lines between them) wrap their text in <p>, which
 * cannot sit inside the checkbox <label>; unwrap it so the label holds
 * phrasing content only.
 */
function inlineContent(children: ReactNode): ReactNode[] {
  const inline: ReactNode[] = []
  Children.forEach(children, (child) => {
    if (isList(child)) return
    if (isValidElement<{ children?: ReactNode }>(child) && child.type === 'p') {
      inline.push(<Fragment key={inline.length}>{child.props.children} </Fragment>)
    } else inline.push(child)
  })
  return inline
}

function TaskItem({ task, children }: { task: Task; children: ReactNode }) {
  const { checks, setCheck } = useAppState()
  const checked = checks[task.key] ?? task.defaultChecked
  const nested = Children.toArray(children).filter(isList)
  return (
    <li className="task-item list-none">
      <Checkbox
        checked={checked}
        onCheckedChange={(next) => setCheck(task.key, next === true)}
        label={inlineContent(children)}
      />
      {nested}
    </li>
  )
}

// GFM renders a disabled <input type=checkbox> wherever the marker sits
// (directly in the li, or inside its <p> for loose lists); TaskItem draws
// the real control, so every source checkbox is dropped.
const TaskInput = () => null

function MarkdownLink({
  href = '',
  pageSlug,
  content,
  children,
}: {
  href?: string
  pageSlug: string
  content: Content
  children: ReactNode
}) {
  const link = resolveLink(href, pageSlug, content)
  if (link.kind === 'external') {
    return (
      <a
        href={link.href}
        target="_blank"
        rel="noreferrer"
        className="prose-link inline-flex items-baseline gap-0.5"
      >
        {children}
        <ExternalLink aria-hidden="true" className="size-3 self-center" />
      </a>
    )
  }
  if (link.kind === 'asset') {
    return (
      <a href={link.href} className="prose-link">
        {children}
      </a>
    )
  }
  return (
    <Link to={link.to} className="prose-link">
      {children}
    </Link>
  )
}

function buildComponents(page: Page, content: Content): Components {
  const tasksByLine = new Map(page.tasks.map((task) => [task.line, task]))
  return {
    pre({ node }) {
      const code = node?.children.find(
        (child): child is Element => child.type === 'element' && child.tagName === 'code',
      )
      const className = code?.properties.className
      const classes = Array.isArray(className) ? className.map(String) : []
      const language = classes.find((name) => name.startsWith('language-'))?.slice('language-'.length)
      return <CodeBlock code={code ? hastText(code) : ''} language={language} />
    },
    // The page header already shows the title; a body h1 would repeat it.
    h1: () => null,
    code({ children }) {
      return <code className="inline-code">{children}</code>
    },
    a({ href, children }) {
      return (
        <MarkdownLink href={href} pageSlug={page.slug} content={content}>
          {children}
        </MarkdownLink>
      )
    },
    input: TaskInput,
    li({ node, children }) {
      // Same parser, same source: the hast position is the mdast position parsePage recorded.
      const task = node?.position ? tasksByLine.get(node.position.start.line) : undefined
      if (task) return <TaskItem task={task}>{children}</TaskItem>
      return <li>{children}</li>
    },
    ul({ className, children }) {
      return (
        <ul className={className?.includes('contains-task-list') ? 'task-list' : undefined}>{children}</ul>
      )
    },
    table({ children }) {
      return (
        <div className="table-wrap">
          <table>{children}</table>
        </div>
      )
    },
  }
}

/**
 * Renders a cheatsheet page. Heading ids come from rehype-slug, which uses
 * the same github-slugger pass as the search index (see lib/content.ts).
 */
export const Markdown = memo(function Markdown({ page, content }: { page: Page; content: Content }) {
  const components = useMemo(() => buildComponents(page, content), [page, content])
  return (
    <div className="prose-cheat">
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSlug]} components={components}>
        {page.body}
      </ReactMarkdown>
    </div>
  )
})
