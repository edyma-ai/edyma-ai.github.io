// A saved-board tile with a live mini-preview rendered from the board's strokes
// (fit-to-content), its title, last-edited time, and a delete action.
import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { Trash2 } from 'react-feather'
import type { Board } from '@/lib/boards'
import { paintStroke, strokesBounds } from '@/lib/strokes'

const PREVIEW_W = 320
const PREVIEW_H = 180

function relativeTime(ts: number): string {
  const diff = Date.now() - ts
  const mins = Math.round(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.round(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.round(hours / 24)
  if (days < 30) return `${days}d ago`
  return new Date(ts).toLocaleDateString()
}

function BoardPreview({ board }: { board: Board }) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const dpr = window.devicePixelRatio || 1
    canvas.width = PREVIEW_W * dpr
    canvas.height = PREVIEW_H * dpr
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    const bounds = strokesBounds(board.strokes)
    if (!bounds) return
    const bw = bounds.maxX - bounds.minX
    const bh = bounds.maxY - bounds.minY
    // Fit-to-content, capped at 1x so small drawings aren't blown up.
    const scale = Math.min(PREVIEW_W / bw, PREVIEW_H / bh, 1)
    const tx = (PREVIEW_W - bw * scale) / 2 - bounds.minX * scale
    const ty = (PREVIEW_H - bh * scale) / 2 - bounds.minY * scale
    ctx.setTransform(dpr * scale, 0, 0, dpr * scale, dpr * tx, dpr * ty)
    for (const stroke of board.strokes) paintStroke(ctx, stroke)
  }, [board.strokes])

  return <canvas ref={ref} className="block w-full bg-white" style={{ aspectRatio: '16 / 9' }} aria-hidden />
}

export function BoardCard({ board, onDelete }: { board: Board; onDelete: (id: string) => void }) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-border/60 bg-surface transition-colors hover:border-primary/30">
      <Link to={`/boards/${board.id}`} className="block">
        <div className="w-full overflow-hidden border-b border-border/60">
          {board.strokes.length > 0 ? (
            <BoardPreview board={board} />
          ) : (
            <div className="flex aspect-video items-center justify-center bg-white text-sm text-slate-400">
              Empty board
            </div>
          )}
        </div>
        <div className="p-4">
          <h3 className="truncate font-semibold text-fg">{board.title || 'Untitled board'}</h3>
          <p className="mt-1 text-xs text-muted">Edited {relativeTime(board.updatedAt)}</p>
        </div>
      </Link>
      <button
        type="button"
        onClick={() => {
          if (window.confirm(`Delete "${board.title || 'Untitled board'}"? This cannot be undone.`)) {
            onDelete(board.id)
          }
        }}
        className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full border border-border bg-surface/90 text-muted opacity-0 shadow transition-all hover:text-red-400 focus:opacity-100 group-hover:opacity-100"
        aria-label="Delete board"
        title="Delete board"
      >
        <Trash2 size={16} />
      </button>
    </div>
  )
}
