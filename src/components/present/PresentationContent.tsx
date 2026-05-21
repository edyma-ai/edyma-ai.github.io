import type { TlmSection } from '@/lib/presentations'
import { MarkdownContent } from '@/components/present/MarkdownContent'

type PresentationContentProps = {
  title: string
  sections: TlmSection[]
}

export function PresentationContent({ title, sections }: PresentationContentProps) {
  const markdown = sections.map((s) => `## ${s.heading}\n\n${s.content}`).join('\n\n---\n\n')

  return (
    <div className="min-h-dvh bg-bg">
      <div className="mx-auto w-full max-w-5xl px-8 py-12 md:px-12">
        <h1 className="markdown-doc-title">{title}</h1>
        <MarkdownContent markdown={markdown} variant="presentation" />
      </div>
    </div>
  )
}
