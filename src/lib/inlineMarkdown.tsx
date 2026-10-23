import type { ReactNode } from 'react'

const LINK = /\[([^\]]+)\]\(([^)\s]+)\)/g

/** Render `[text](url)` links inside a plain string; everything else stays text. */
export function renderInlineMarkdown(text: string): ReactNode[] {
  const nodes: ReactNode[] = []
  let last = 0
  for (const match of text.matchAll(LINK)) {
    const [whole, label, href] = match
    const index = match.index ?? 0
    if (index > last) nodes.push(text.slice(last, index))
    const external = /^https?:/.test(href)
    nodes.push(
      <a
        key={index}
        href={href}
        {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}
      >
        {label}
      </a>,
    )
    last = index + whole.length
  }
  if (last < text.length) nodes.push(text.slice(last))
  return nodes
}
