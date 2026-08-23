// Floating tool panel for the board editor: tool selection, color + size,
// undo/redo, clear, zoom, and pan toggle. Pure presentational — all state lives
// in BoardEditorPage.
import type { ReactNode } from 'react'
import { MousePointer, Move, RotateCcw, RotateCw, ZoomIn, ZoomOut } from 'react-feather'
import type { ToolKind } from '@/lib/boards'
import { DEFAULT_COLORS } from '@/lib/strokes'
import { cn } from '@/lib/cn'
import { ClearIcon, EraserIcon, HighlighterIcon, PencilIcon, PenIcon } from './ToolIcons'

interface BoardToolbarProps {
  tool: ToolKind
  onToolChange: (tool: ToolKind) => void
  color: string
  onColorChange: (color: string) => void
  size: number
  onSizeChange: (size: number) => void
  panMode: boolean
  onPanModeToggle: () => void
  selectMode: boolean
  onSelectModeToggle: () => void
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
    selectMode,
    onSelectModeToggle,
    canUndo,
    canRedo,
    onUndo,
    onRedo,
    onClear,
    onZoomIn,
    onZoomOut,
    onResetView,
  } = props

  const isCustomColor = !DEFAULT_COLORS.some((c) => c.toLowerCase() === color.toLowerCase())

  return (
    <div className="pointer-events-auto flex flex-wrap items-center gap-1 rounded-2xl border border-border bg-surface p-2 shadow-xl">
      <ToolButton active={tool === 'pen' && !panMode && !selectMode} onClick={() => onToolChange('pen')} label="Pen">
        <PenIcon />
      </ToolButton>
      <ToolButton active={tool === 'pencil' && !panMode && !selectMode} onClick={() => onToolChange('pencil')} label="Pencil">
        <PencilIcon />
      </ToolButton>
      <ToolButton active={tool === 'highlighter' && !panMode && !selectMode} onClick={() => onToolChange('highlighter')} label="Highlighter">
        <HighlighterIcon />
      </ToolButton>
      <ToolButton active={tool === 'eraser' && !panMode && !selectMode} onClick={() => onToolChange('eraser')} label="Eraser">
        <EraserIcon />
      </ToolButton>

      <Divider />

      <ToolButton active={selectMode} onClick={onSelectModeToggle} label="Select">
        <MousePointer size={20} />
      </ToolButton>
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
        <label
          className={cn(
            'relative h-6 w-6 cursor-pointer overflow-hidden rounded-full border transition-transform hover:scale-110',
            isCustomColor ? 'border-primary ring-2 ring-primary' : 'border-border',
          )}
          title="Custom color"
        >
          {/* Rainbow spectrum signals "pick any color"; the inner dot shows the
              current custom selection when one is active. */}
          <span
            className="absolute inset-0"
            style={{
              background:
                'conic-gradient(from 90deg, #ef4444, #f59e0b, #eab308, #10b981, #06b6d4, #3b82f6, #8b5cf6, #ec4899, #ef4444)',
            }}
          />
          {isCustomColor ? (
            <span
              className="absolute inset-1.5 rounded-full border border-white/70 shadow-sm"
              style={{ backgroundColor: color }}
            />
          ) : null}
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
        <ClearIcon />
      </ToolButton>
    </div>
  )
}
