// Floating context toolbar anchored above (or below) the current selection.
import type { ReactNode } from 'react'
import { Clipboard, Copy, Scissors, Trash2 } from 'react-feather'
import type { SelectionRect } from './BoardCanvas'
import { cn } from '@/lib/cn'

interface SelectionToolbarProps {
  rect: SelectionRect
  canPaste: boolean
  onCopy: () => void
  onCut: () => void
  onPaste: () => void
  onDuplicate: () => void
  onDelete: () => void
}

function SelButton({
  onClick,
  label,
  disabled,
  variant = 'default',
  children,
}: {
  onClick: () => void
  label: string
  disabled?: boolean
  variant?: 'default' | 'danger'
  children: ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={cn(
        'flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-150 active:scale-90 disabled:cursor-not-allowed disabled:opacity-40',
        variant === 'danger'
          ? 'text-muted hover:bg-red-500/10 hover:text-red-500'
          : 'text-fg hover:bg-surface-hover hover:text-primary',
      )}
    >
      {children}
    </button>
  )
}

// Duplicate uses stacked squares to read as "make a copy in place".
function DuplicateIcon() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="8" y="8" width="12" height="12" rx="2" />
      <path d="M4 16V6a2 2 0 0 1 2-2h10" />
    </svg>
  )
}

export function SelectionToolbar({ rect, canPaste, onCopy, onCut, onPaste, onDuplicate, onDelete }: SelectionToolbarProps) {
  // Place above the selection; flip below when there isn't room near the top.
  const placeBelow = rect.y < 60
  return (
    <div
      className="pointer-events-auto absolute z-30 flex items-center gap-0.5 rounded-xl border border-border bg-surface p-1 shadow-xl"
      style={{
        left: rect.x + rect.width / 2,
        top: placeBelow ? rect.y + rect.height + 8 : rect.y - 8,
        transform: placeBelow ? 'translate(-50%, 0)' : 'translate(-50%, -100%)',
      }}
    >
      <SelButton onClick={onDuplicate} label="Duplicate">
        <DuplicateIcon />
      </SelButton>
      <SelButton onClick={onCopy} label="Copy">
        <Copy size={16} />
      </SelButton>
      <SelButton onClick={onCut} label="Cut">
        <Scissors size={16} />
      </SelButton>
      <SelButton onClick={onPaste} label="Paste" disabled={!canPaste}>
        <Clipboard size={16} />
      </SelButton>
      <span className="mx-0.5 h-5 w-px bg-border" />
      <SelButton onClick={onDelete} label="Delete" variant="danger">
        <Trash2 size={16} />
      </SelButton>
    </div>
  )
}
