import { AlertTriangle, RefreshCw } from 'react-feather'
import { cn } from '@/lib/cn'

interface ErrorStateProps {
  title?: string
  message?: string
  onRetry?: () => void
  className?: string
}

export function ErrorState({ title = 'Something went wrong', message, onRetry, className }: ErrorStateProps) {
  return (
    <div role="alert" className={cn('flex flex-col items-center justify-center gap-1 px-6 py-14 text-center', className)}>
      <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500/10 text-red-400">
        <AlertTriangle size={20} />
      </span>
      <p className="text-base font-semibold text-fg">{title}</p>
      {message ? <p className="max-w-sm text-sm text-muted">{message}</p> : null}
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-fg transition-colors hover:border-muted hover:bg-surface-hover"
        >
          <RefreshCw size={14} />
          Try again
        </button>
      ) : null}
    </div>
  )
}
