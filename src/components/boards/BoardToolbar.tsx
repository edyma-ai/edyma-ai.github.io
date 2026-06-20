// Floating tool panel for the board editor: tool selection, color + size,
// undo/redo, clear, zoom, and pan toggle. Pure presentational — all state lives
// in BoardEditorPage.
import type { ReactNode } from 'react'
import { Edit2, Edit3, Move, RotateCcw, RotateCw, Trash2, ZoomIn, ZoomOut } from 'react-feather'
import type { ToolKind } from '@/lib/boards'
import { DEFAULT_COLORS } from '@/lib/strokes'
import { cn } from '@/lib/cn'

interface BoardToolbarProps {
  tool: ToolKind
  onToolChange: (tool: ToolKind) => void
  color: string
  onColorChange: (color: string) => void
  size: number
  onSizeChange: (size: number) => void
  panMode: boolean
  onPanModeToggle: () => void
  canUndo: boolean
  canRedo: boolean
  onUndo: () => void
  onRedo: () => void
  onClear: () => void
  onZoomIn: () => void
  onZoomOut: () => void
  onResetView: () => void
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
        'flex h-10 w-10 items-center justify-center rounded-lg transition-colors',
        'text-fg hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-40',
        active && 'bg-primary-muted text-primary',
      )}
    >
      {children}
    </button>
  )
}

// Eraser: react-feather has no eraser glyph, so use a small inline icon.
function EraserIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L9 17l-5 .5.5-5z" />
      <path d="M14 6 18 10" />
    </svg>
  )
}

// Highlighter: inline marker-style icon.
function HighlighterIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="m9 11 6-6 4 4-6 6z" />
      <path d="M9 11 5 15v4h4l2-2" />
      <path d="M4 21h6" />
    </svg>
  )
}

const Divider = () => <div className="mx-1 h-7 w-px bg-border" />

export function BoardToolbar(props: BoardToolbarProps) {
  const {
    tool,
    onToolChange,
    color,
    onColorChange,
    size,
    onSizeChange,
    panMode,
    onPanModeToggle,
    canUndo,
    canRedo,
    onUndo,
    onRedo,
    onClear,
    onZoomIn,
    onZoomOut,
    onResetView,
  } = props

  return (
    <div className="pointer-events-auto flex flex-wrap items-center gap-1 rounded-2xl border border-border bg-surface p-2 shadow-xl">
      <ToolButton active={tool === 'pen' && !panMode} onClick={() => onToolChange('pen')} label="Pen">
        <Edit3 size={20} />
      </ToolButton>
      <ToolButton active={tool === 'pencil' && !panMode} onClick={() => onToolChange('pencil')} label="Pencil">
        <Edit2 size={20} />
      </ToolButton>
      <ToolButton active={tool === 'highlighter' && !panMode} onClick={() => onToolChange('highlighter')} label="Highlighter">
        <HighlighterIcon />
      </ToolButton>
      <ToolButton active={tool === 'eraser' && !panMode} onClick={() => onToolChange('eraser')} label="Eraser">
        <EraserIcon />
      </ToolButton>

      <Divider />

      <ToolButton active={panMode} onClick={onPanModeToggle} label="Pan / move">
        <Move size={20} />
      </ToolButton>

      <Divider />

      {/* Colors */}
      <div className="flex items-center gap-1">
        {DEFAULT_COLORS.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => onColorChange(c)}
            aria-label={`Color ${c}`}
            title={c}
            className={cn(
              'h-6 w-6 rounded-full border transition-transform hover:scale-110',
              color.toLowerCase() === c.toLowerCase() ? 'border-primary ring-2 ring-primary' : 'border-border',
            )}
            style={{ backgroundColor: c }}
          />
        ))}
        <label className="relative h-6 w-6 cursor-pointer overflow-hidden rounded-full border border-border" title="Custom color">
          <span className="absolute inset-0" style={{ backgroundColor: color }} />
          <input
            type="color"
            value={color}
            onChange={(e) => onColorChange(e.target.value)}
            className="absolute inset-0 cursor-pointer opacity-0"
            aria-label="Custom color"
          />
        </label>
      </div>

      <Divider />

      {/* Size */}
      <label className="flex items-center gap-2 px-1 text-xs text-muted" title="Brush size">
        <input
          type="range"
          min={1}
          max={40}
          value={size}
          onChange={(e) => onSizeChange(Number(e.target.value))}
          className="w-24 accent-[var(--color-primary)]"
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

      <Divider />

      <ToolButton onClick={onZoomOut} label="Zoom out">
        <ZoomOut size={20} />
      </ToolButton>
      <ToolButton onClick={onResetView} label="Reset view">
        <span className="text-xs font-semibold">1:1</span>
      </ToolButton>
      <ToolButton onClick={onZoomIn} label="Zoom in">
        <ZoomIn size={20} />
      </ToolButton>

      <Divider />

      <ToolButton onClick={onClear} label="Clear board">
        <Trash2 size={20} />
      </ToolButton>
    </div>
  )
}
