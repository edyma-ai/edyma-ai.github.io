import type { TlmSection } from '@/lib/presentations'
import { MarkdownContent } from '@/components/present/MarkdownContent'

type PresentationContentProps = {
  title: string
  sections: TlmSection[]
}

export function PresentationContent({ title, sections }: PresentationContentProps) {
  const markdown = sections.map((s) => `## ${s.heading}\n\n${s.content}`).join('\n\n---\n\n')

  return (
    <div className="w-full bg-bg">
      <div className="w-full px-8 pt-6 pb-12">
        <h1 className="markdown-doc-title">{title}</h1>
        <MarkdownContent markdown={markdown} variant="presentation" />
      </div>
    </div>
  )
}
