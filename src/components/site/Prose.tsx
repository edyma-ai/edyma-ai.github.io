import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

interface ProseProps {
  children: ReactNode
  className?: string
}

/**
 * Reading-optimized typography wrapper for long-form content like
 * legal pages. Uses Tailwind utilities scoped via descendant selectors
 * so we don't need the @tailwindcss/typography plugin.
 */
export function Prose({ children, className }: ProseProps) {
  return (
    <div
      className={cn(
        'text-[0.95rem] leading-relaxed text-fg/90',
        '[&_h2]:mt-10 [&_h2]:mb-3 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:tracking-tight [&_h2]:text-fg',
        '[&_h3]:mt-6 [&_h3]:mb-2 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-fg',
        '[&_p]:my-3',
        '[&_ul]:my-3 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5',
        '[&_li]:marker:text-muted',
        '[&_strong]:font-semibold [&_strong]:text-fg',
        '[&_a]:text-accent [&_a]:underline-offset-2 hover:[&_a]:text-accent-hover hover:[&_a]:underline',
        className,
      )}
    >
      {children}
    </div>
  )
}
