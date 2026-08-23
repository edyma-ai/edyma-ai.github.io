import { useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import type { ExtraProps } from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import 'katex/dist/katex.min.css'
import '@/styles/markdown.css'

import { cn } from '@/lib/cn'
import { interactiveSlug, isS3Uri, normalizeInlineMath, s3UriToKey } from '@/lib/markdown'
import { resolveS3Url } from '@/lib/s3'
import { InteractiveEmbed } from '@/components/classroom/InteractiveEmbed'
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
          img: MarkdownAsset,
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

/**
 * An image in Edyma content is one of three things: an `interactive://` sim
 * (rendered live), an `s3://` reference into the private bucket (exchanged for
 * a presigned URL), or a plain URL. The presentation flow hands over already
 * resolved URLs, so it takes the last branch unchanged.
 */
function MarkdownAsset({ src, alt }: React.ImgHTMLAttributes<HTMLImageElement> & ExtraProps) {
  const source = typeof src === 'string' ? src : ''
  const slug = interactiveSlug(source)
  const needsResolving = isS3Uri(source)
  const [resolved, setResolved] = useState<string | null>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    if (!isS3Uri(source)) return
    let cancelled = false
    resolveS3Url(s3UriToKey(source))
      .then((url) => {
        if (!cancelled) setResolved(url)
      })
      .catch(() => {
        if (!cancelled) setFailed(true)
      })
    return () => {
      cancelled = true
    }
  }, [source])

  if (slug) return <InteractiveEmbed elementId={slug} />
  if (needsResolving) {
    if (failed) return <MarkdownImage alt={alt} />
    if (!resolved) {
      return (
        <span className="markdown-image-placeholder">
          <span className="markdown-spinner" aria-hidden="true" />
          Loading image…
        </span>
      )
    }
    return <MarkdownImage src={resolved} alt={alt} />
  }
  return <MarkdownImage src={source} alt={alt} />
}
