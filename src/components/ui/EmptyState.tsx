import type { ReactNode } from 'react'
import { Inbox } from 'react-feather'
import { cn } from '@/lib/cn'

interface EmptyStateProps {
  icon?: typeof Inbox
  title: string
  description?: string
  action?: ReactNode
  className?: string
}

export function EmptyState({ icon: Icon = Inbox, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-1 px-6 py-14 text-center', className)}>
      <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-muted text-primary">
        <Icon size={20} />
      </span>
      <p className="text-base font-semibold text-fg">{title}</p>
      {description ? <p className="max-w-sm text-sm text-muted">{description}</p> : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  )
}
