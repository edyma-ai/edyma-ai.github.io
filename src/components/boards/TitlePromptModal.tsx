// Modal shown the first time a board needs a title (before the first autosave).
import { useEffect, useRef, useState } from 'react'

interface TitlePromptModalProps {
  initialValue?: string
  onSubmit: (title: string) => void
  onCancel: () => void
}

export function TitlePromptModal({ initialValue = '', onSubmit, onCancel }: TitlePromptModalProps) {
  const [value, setValue] = useState(initialValue)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onCancel])

  const submit = () => {
    const trimmed = value.trim()
    if (trimmed) onSubmit(trimmed)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-6"
      role="dialog"
      aria-modal="true"
      aria-label="Name your board"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onCancel()
      }}
    >
      <div className="w-full max-w-sm rounded-2xl border border-border bg-surface p-6 shadow-2xl">
        <h2 className="text-lg font-semibold text-fg">Name your board</h2>
        <p className="mt-1 text-sm text-muted">Give this board a title so you can find it later.</p>
        <input
          ref={inputRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') submit()
          }}
          placeholder="e.g. Photosynthesis — Grade 7"
          className="mt-4 w-full rounded-lg border border-border bg-bg px-3 py-2 text-fg outline-none focus:border-primary"
        />
        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg px-4 py-2 text-sm font-medium text-muted transition-colors hover:bg-surface-hover"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={!value.trim()}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-fg transition-colors hover:bg-primary-hover disabled:opacity-40"
          >
            Save board
          </button>
        </div>
      </div>
    </div>
  )
}
