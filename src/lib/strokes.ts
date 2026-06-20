// perfect-freehand wrappers: per-tool stroke presets, outline → Path2D, canvas
// rendering, eraser hit-testing, and bounds for previews/PNG export.
import { getStroke } from 'perfect-freehand'
import type { Stroke, ToolKind } from '@/lib/boards'

export interface ToolPreset {
  /** perfect-freehand options (size is supplied per-stroke). */
  options: {
    thinning: number
    smoothing: number
    streamline: number
    cap: boolean
  }
  /** Fill opacity. Highlighter is translucent so it layers over existing ink. */
  opacity: number
  /** Default brush size for the tool, in world px. */
  defaultSize: number
}

export const TOOL_PRESETS: Record<Exclude<ToolKind, 'eraser'>, ToolPreset> = {
  pen: {
    options: { thinning: 0.5, smoothing: 0.5, streamline: 0.5, cap: true },
    opacity: 1,
    defaultSize: 6,
  },
  pencil: {
    // Sketchier: more speed-based thinning, slightly translucent, thinner default.
    options: { thinning: 0.7, smoothing: 0.6, streamline: 0.45, cap: true },
    opacity: 0.85,
    defaultSize: 4,
  },
  highlighter: {
    // Flat, fat, very translucent — emphasis over content.
    options: { thinning: 0, smoothing: 0.5, streamline: 0.5, cap: false },
    opacity: 0.3,
    defaultSize: 22,
  },
}

export const DEFAULT_COLORS = [
  '#0f172a', // slate (ink)
  '#ef4444', // red
  '#f59e0b', // amber
  '#10b981', // emerald
  '#3b82f6', // blue
  '#8b5cf6', // violet
  '#ffffff', // white (for dark surface)
] as const

/** Build a filled Path2D polygon for a stroke's perfect-freehand outline. */
export function strokeToPath(stroke: Stroke): Path2D {
  const preset = stroke.tool === 'eraser' ? TOOL_PRESETS.pen : TOOL_PRESETS[stroke.tool]
  const outline = getStroke(stroke.points, { size: stroke.size, ...preset.options })
  const path = new Path2D()
  if (outline.length === 0) return path
  path.moveTo(outline[0][0], outline[0][1])
  for (let i = 1; i < outline.length; i++) {
    path.lineTo(outline[i][0], outline[i][1])
  }
  path.closePath()
  return path
}

/** Fill one stroke onto a 2D context (caller sets the world transform). */
export function paintStroke(ctx: CanvasRenderingContext2D, stroke: Stroke): void {
  if (stroke.points.length === 0) return
  const preset = stroke.tool === 'eraser' ? TOOL_PRESETS.pen : TOOL_PRESETS[stroke.tool]
  ctx.save()
  ctx.globalAlpha = preset.opacity
  ctx.fillStyle = stroke.color
  ctx.fill(strokeToPath(stroke))
  ctx.restore()
}

/** Squared distance from point p to segment ab — used for eraser hit-testing. */
function distToSegmentSq(px: number, py: number, ax: number, ay: number, bx: number, by: number): number {
  const dx = bx - ax
  const dy = by - ay
  const lenSq = dx * dx + dy * dy
  let t = lenSq === 0 ? 0 : ((px - ax) * dx + (py - ay) * dy) / lenSq
  t = Math.max(0, Math.min(1, t))
  const cx = ax + t * dx
  const cy = ay + t * dy
  return (px - cx) * (px - cx) + (py - cy) * (py - cy)
}

/** True if world point (x,y) lies within `radius` of any segment of the stroke. */
export function strokeHit(stroke: Stroke, x: number, y: number, radius: number): boolean {
  const pts = stroke.points
  const r = radius + stroke.size / 2
  const rSq = r * r
  if (pts.length === 1) {
    const dx = pts[0][0] - x
    const dy = pts[0][1] - y
    return dx * dx + dy * dy <= rSq
  }
  for (let i = 1; i < pts.length; i++) {
    if (distToSegmentSq(x, y, pts[i - 1][0], pts[i - 1][1], pts[i][0], pts[i][1]) <= rSq) {
      return true
    }
  }
  return false
}

export interface Bounds {
  minX: number
  minY: number
  maxX: number
  maxY: number
}

/** Axis-aligned bounds of all strokes (padded), or null when there's nothing drawn. */
export function strokesBounds(strokes: Stroke[], pad = 16): Bounds | null {
  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity
  for (const stroke of strokes) {
    const half = stroke.size / 2
    for (const [x, y] of stroke.points) {
      minX = Math.min(minX, x - half)
      minY = Math.min(minY, y - half)
      maxX = Math.max(maxX, x + half)
      maxY = Math.max(maxY, y + half)
    }
  }
  if (!Number.isFinite(minX)) return null
  return { minX: minX - pad, minY: minY - pad, maxX: maxX + pad, maxY: maxY + pad }
}
