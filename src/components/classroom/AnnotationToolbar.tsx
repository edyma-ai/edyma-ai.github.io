// Floating controls for the annotation layer: tools, colour, size, history,
// clear, and where the teacher's marks currently stand with the server.
import { useState, type ReactNode } from 'react'
import { RotateCcw, RotateCw } from 'react-feather'
import { ClearIcon, EraserIcon, HighlighterIcon, PenIcon } from '@/components/boards/ToolIcons'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import type { AnnotationTool } from '@/components/classroom/AnnotationLayer'
import { DEFAULT_COLORS } from '@/lib/strokes'
import { cn } from '@/lib/cn'

export type AnnotationSaveState = 'saved' | 'saving' | 'unsaved' | 'error'

interface AnnotationToolbarProps {
  tool: AnnotationTool | null
  /** Passing the active tool again turns annotation off, so the page scrolls and links work. */
  onToolChange: (tool: AnnotationTool | null) => void
  color: string
  onColorChange: (color: string) => void
  size: number
  onSizeChange: (size: number) => void
  canUndo: boolean
  canRedo: boolean
  onUndo: () => void
  onRedo: () => void
  hasStrokes: boolean
  onClear: () => void
  saveState: AnnotationSaveState
}

const SAVE_LABELS: Record<AnnotationSaveState, string> = {
  saved: 'Saved',
  saving: 'Saving…',
  unsaved: 'Unsaved',
  error: "Couldn't save",
}

function ToolButton({
  active,
  onClick,
  label,
  disabled,
  children,
}: {
  active?: boolean
  onClick: () => void
  label: string
  disabled?: boolean
  children: ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      aria-pressed={active}
      title={label}
      className={cn(
        'flex h-10 w-10 items-center justify-center rounded-lg transition-all duration-150 active:scale-90',
        'text-fg hover:bg-surface-hover hover:text-primary disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-fg',
        active && 'bg-primary-muted text-primary',
      )}
    >
      {children}
    </button>
  )
}

const Divider = () => <div className="mx-1 h-7 w-px bg-border" />

export function AnnotationToolbar(props: AnnotationToolbarProps) {
  const { tool, onToolChange, color, onColorChange, size, onSizeChange, canUndo, canRedo, onUndo, onRedo, hasStrokes, onClear, saveState } = props
  const [confirmingClear, setConfirmingClear] = useState(false)

  const selectTool = (next: AnnotationTool) => onToolChange(tool === next ? null : next)

  return (
    <div className="pointer-events-auto flex flex-wrap items-center gap-1 rounded-2xl border border-border bg-surface p-2 shadow-xl">
      <ToolButton active={tool === 'pen'} onClick={() => selectTool('pen')} label="Pen (click again to read and scroll)">
        <PenIcon />
      </ToolButton>
      <ToolButton active={tool === 'highlighter'} onClick={() => selectTool('highlighter')} label="Highlighter">
        <HighlighterIcon />
      </ToolButton>
      <ToolButton active={tool === 'eraser'} onClick={() => selectTool('eraser')} label="Eraser">
        <EraserIcon />
      </ToolButton>

      <Divider />

      <div className="flex items-center gap-1">
        {DEFAULT_COLORS.map((swatch) => (
          <button
            key={swatch}
            type="button"
            onClick={() => onColorChange(swatch)}
            aria-label={`Color ${swatch}`}
            title={swatch}
            className={cn(
              'h-6 w-6 rounded-full border transition-transform hover:scale-110',
              color.toLowerCase() === swatch.toLowerCase() ? 'border-primary ring-2 ring-primary' : 'border-border',
            )}
            style={{ backgroundColor: swatch }}
          />
        ))}
      </div>

      <Divider />

      <label className="flex items-center gap-2 px-1 text-xs text-muted" title="Brush size">
        <input
          type="range"
          min={1}
          max={40}
          value={size}
          onChange={(event) => onSizeChange(Number(event.target.value))}
          className="w-20 accent-[var(--color-primary)]"
          aria-label="Brush size"
        />
        <span className="w-5 tabular-nums text-fg">{size}</span>
      </label>

      <Divider />

      <ToolButton onClick={onUndo} disabled={!canUndo} label="Undo">
        <RotateCcw size={20} />
      </ToolButton>
      <ToolButton onClick={onRedo} disabled={!canRedo} label="Redo">
        <RotateCw size={20} />
      </ToolButton>
      <ToolButton onClick={() => setConfirmingClear(true)} disabled={!hasStrokes} label="Clear annotations">
        <ClearIcon />
      </ToolButton>

      <Divider />

      <span
        className={cn(
          'flex items-center gap-1.5 px-2 text-xs',
          saveState === 'error' ? 'text-red-400' : saveState === 'saved' ? 'text-muted' : 'text-amber-500',
        )}
      >
        <span
          className={cn(
            'h-1.5 w-1.5 rounded-full',
            saveState === 'saving'
              ? 'animate-pulse bg-amber-500'
              : saveState === 'saved'
                ? 'bg-emerald-500'
                : saveState === 'error'
                  ? 'bg-red-400'
                  : 'bg-amber-500',
          )}
        />
        {SAVE_LABELS[saveState]}
      </span>

      {confirmingClear ? (
        <ConfirmModal
          title="Clear annotations?"
          message="This removes every mark on this study guide. You can undo it afterwards."
          confirmLabel="Clear annotations"
          onConfirm={onClear}
          onClose={() => setConfirmingClear(false)}
        />
      ) : null}
    </div>
  )
}
