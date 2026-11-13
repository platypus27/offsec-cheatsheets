import { Fragment, useMemo } from 'react'

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

/**
 * Marks every query term (not the whole query string, unlike teal's
 * HighlightText) so multi-word searches light up each matched word.
 */
export function TermHighlight({ text, query }: { text: string; query: string }) {
  const parts = useMemo(() => {
    const terms = query
      .toLowerCase()
      .split(/[\s\p{P}]+/u)
      .filter((term) => term.length > 1)
      .sort((a, b) => b.length - a.length)
    if (terms.length === 0) return [{ text, match: false }]
    const regex = new RegExp(`(${terms.map(escapeRegExp).join('|')})`, 'gi')
    return text
      .split(regex)
      .filter(Boolean)
      .map((part) => ({ text: part, match: terms.includes(part.toLowerCase()) }))
  }, [text, query])

  return (
    <>
      {parts.map((part, index) =>
        part.match ? (
          <mark key={index} className="rounded-sm bg-teal-secondary-container px-0.5 text-teal-on-secondary-container">
            {part.text}
          </mark>
        ) : (
          <Fragment key={index}>{part.text}</Fragment>
        ),
      )}
    </>
  )
}
