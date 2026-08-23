// Reusable confirmation dialog on the site palette (replaces window.confirm).
import { useEffect } from 'react'

export interface ConfirmOptions {
  title: string
  message: string
  confirmLabel: string
  /** When true, the confirm button uses destructive (red) styling. */
  danger?: boolean
  onConfirm: () => void
}

interface ConfirmModalProps extends ConfirmOptions {
  onClose: () => void
}

export function ConfirmModal({ title, message, confirmLabel, danger = true, onConfirm, onClose }: ConfirmModalProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'Enter') {
        onConfirm()
        onClose()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose, onConfirm])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-6"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="w-full max-w-sm rounded-2xl border border-border bg-surface p-6 shadow-2xl">
        <h2 className="text-lg font-semibold text-fg">{title}</h2>
        <p className="mt-2 text-sm text-muted">{message}</p>
        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm font-medium text-muted transition-colors hover:bg-surface-hover hover:text-fg"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm()
              onClose()
            }}
            className={
              danger
                ? 'rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-600'
                : 'rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-fg transition-colors hover:bg-primary-hover'
            }
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
