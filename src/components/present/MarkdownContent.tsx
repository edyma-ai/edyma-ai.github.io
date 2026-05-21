import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import 'katex/dist/katex.min.css'
import '@/styles/markdown.css'

import { cn } from '@/lib/cn'
import { normalizeInlineMath } from '@/lib/markdown'
import { MarkdownImage } from '@/components/present/MarkdownImage'

type MarkdownContentProps = {
  markdown: string
  variant?: 'default' | 'presentation'
}

export function MarkdownContent({ markdown, variant = 'default' }: MarkdownContentProps) {
  const normalized = normalizeInlineMath(markdown)

  return (
    <article className={cn('markdown-body', variant === 'presentation' && 'markdown-presentation')}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          img: MarkdownImage,
          a: ({ href, children }) => (
            <a href={href} target="_blank" rel="noopener noreferrer">
              {children}
            </a>
          ),
        }}
      >
        {normalized}
      </ReactMarkdown>
    </article>
  )
}
