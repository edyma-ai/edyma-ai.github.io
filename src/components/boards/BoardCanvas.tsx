// The drawing surface: an HTML5 canvas with pointer-driven freehand input,
// pan/zoom, DPR-crisp rendering, and stroke-level erasing. Committed strokes are
// owned by the parent (BoardEditorPage) so undo/redo and autosave live there;
// this component only manages the in-progress stroke, the pending-erase set, and
// the view transform (pan/zoom), none of which are persisted.
import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react'
import type { Stroke, ToolKind } from '@/lib/boards'
import { TOOL_PRESETS, paintStroke, shouldRecordPoint, strokeHit, strokesBounds } from '@/lib/strokes'

export interface BoardCanvasHandle {
  resetView: () => void
  zoomBy: (factor: number) => void
  /** World coordinate at the centre of the visible canvas (for paste-at-viewport). */
  getViewportCenterWorld: () => { x: number; y: number }
}

/** Details emitted when the user right-clicks the canvas. */
export interface BoardContextInfo {
  /** Cursor position in screen px, relative to the canvas/editor root. */
  x: number
  y: number
  /** Cursor position in world (board) coordinates. */
  worldX: number
  worldY: number
  /** Whether a stroke sits under the cursor, and which one. */
  onStroke: boolean
  hitIndex: number
}

/** Screen-space (CSS px, relative to the canvas) bounds of the current selection. */
export interface SelectionRect {
  x: number
  y: number
  width: number
  height: number
}

interface BoardCanvasProps {
  strokes: Stroke[]
  tool: ToolKind
  color: string
  size: number
  /** Hand tool — pointer drags pan instead of draw. */
  panMode: boolean
  /** Select tool — pointer selects/moves strokes instead of drawing. */
  selectMode: boolean
  selectedIndices: number[]
  onCommitStroke: (stroke: Stroke) => void
  onEraseStrokes: (removeIndices: number[]) => void
  onSelectionChange: (indices: number[]) => void
  onMoveStrokes: (indices: number[], dx: number, dy: number) => void
  /** Reports the selection's screen rect (or null) so the parent can anchor a toolbar. */
  onSelectionRect: (rect: SelectionRect | null) => void
  /** Fired on right-click so the parent can open a context menu. */
  onContextMenu: (info: BoardContextInfo) => void
}

interface View {
  scale: number
  offsetX: number
  offsetY: number
}

const MIN_SCALE = 0.2
const MAX_SCALE = 8
const ERASER_RADIUS = 6 // screen px tolerance, scaled to world at hit-test time
const SELECT_RADIUS = 6 // screen px tolerance for clicking a stroke
const SELECTION_COLOR = '#3b82f6'

export const BoardCanvas = forwardRef<BoardCanvasHandle, BoardCanvasProps>(function BoardCanvas(
  {
    strokes,
    tool,
    color,
    size,
    panMode,
    selectMode,
    selectedIndices,
    onCommitStroke,
    onEraseStrokes,
    onSelectionChange,
    onMoveStrokes,
    onSelectionRect,
    onContextMenu,
  },
  ref,
) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const viewRef = useRef<View>({ scale: 1, offsetX: 0, offsetY: 0 })
  const [, forceRender] = useState(0)
  const requestPaint = useCallback(() => forceRender((n) => n + 1), [])

  // Mutable interaction state (refs so handlers don't churn on every render).
  const currentStroke = useRef<Stroke | null>(null)
  const erased = useRef<Set<number>>(new Set())
  const pointers = useRef<Map<number, { x: number; y: number }>>(new Map())
  const gesture = useRef<'idle' | 'draw' | 'erase' | 'pan' | 'pinch' | 'marquee' | 'move'>('idle')
  const panStart = useRef({ x: 0, y: 0, offsetX: 0, offsetY: 0 })
  const pinchStart = useRef({ dist: 0, scale: 1, cx: 0, cy: 0, offsetX: 0, offsetY: 0 })
  // Selection interaction state.
  const marquee = useRef<{ x0: number; y0: number; x1: number; y1: number } | null>(null)
  const moveDelta = useRef({ dx: 0, dy: 0 })
  const selectStart = useRef({ x: 0, y: 0 })
  const moveIndices = useRef<number[]>([])
  const moved = useRef(false)
  const lastSelRect = useRef<SelectionRect | null>(null)

  useImperativeHandle(ref, () => ({
    resetView: () => {
      viewRef.current = { scale: 1, offsetX: 0, offsetY: 0 }
      requestPaint()
    },
    zoomBy: (factor: number) => {
      const canvas = canvasRef.current
      if (!canvas) return
      const rect = canvas.getBoundingClientRect()
      zoomAround(rect.width / 2, rect.height / 2, factor)
    },
    getViewportCenterWorld: () => {
      const canvas = canvasRef.current
      if (!canvas) return { x: 0, y: 0 }
      const rect = canvas.getBoundingClientRect()
      return screenToWorld(rect.width / 2, rect.height / 2)
    },
  }))

  const screenToWorld = useCallback((sx: number, sy: number) => {
    const { scale, offsetX, offsetY } = viewRef.current
    return { x: (sx - offsetX) / scale, y: (sy - offsetY) / scale }
  }, [])

  const zoomAround = useCallback(
    (sx: number, sy: number, factor: number) => {
      const v = viewRef.current
      const next = Math.max(MIN_SCALE, Math.min(MAX_SCALE, v.scale * factor))
      const ratio = next / v.scale
      // Keep the world point under (sx,sy) fixed while scaling.
      viewRef.current = {
        scale: next,
        offsetX: sx - (sx - v.offsetX) * ratio,
        offsetY: sy - (sy - v.offsetY) * ratio,
      }
      requestPaint()
    },
    [requestPaint],
  )

  // --- Rendering -----------------------------------------------------------
  const paint = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const dpr = window.devicePixelRatio || 1
    const { scale, offsetX, offsetY } = viewRef.current

    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.setTransform(dpr * scale, 0, 0, dpr * scale, dpr * offsetX, dpr * offsetY)

    const moving = gesture.current === 'move'
    const mdx = moving ? moveDelta.current.dx : 0
    const mdy = moving ? moveDelta.current.dy : 0
    const selSet = selectMode && selectedIndices.length ? new Set(selectedIndices) : null

    for (let i = 0; i < strokes.length; i++) {
      if (erased.current.has(i)) continue
      // While dragging a selection, render the selected strokes at their live offset.
      if (moving && selSet?.has(i)) {
        ctx.save()
        ctx.translate(mdx, mdy)
        paintStroke(ctx, strokes[i])
        ctx.restore()
      } else {
        paintStroke(ctx, strokes[i])
      }
    }
    if (currentStroke.current) paintStroke(ctx, currentStroke.current)

    // Selection overlay: dashed box around the selection + the marquee rectangle.
    if (selectMode) {
      ctx.save()
      if (selSet) {
        const b = strokesBounds(
          selectedIndices.map((i) => strokes[i]).filter(Boolean),
          8,
        )
        if (b) {
          ctx.translate(mdx, mdy)
          ctx.strokeStyle = SELECTION_COLOR
          ctx.lineWidth = 1.5 / scale
          ctx.setLineDash([6 / scale, 4 / scale])
          ctx.strokeRect(b.minX, b.minY, b.maxX - b.minX, b.maxY - b.minY)
          ctx.translate(-mdx, -mdy)
        }
      }
      if (marquee.current) {
        const { x0, y0, x1, y1 } = marquee.current
        const rx = Math.min(x0, x1)
        const ry = Math.min(y0, y1)
        ctx.fillStyle = 'rgba(59, 130, 246, 0.12)'
        ctx.strokeStyle = SELECTION_COLOR
        ctx.lineWidth = 1 / scale
        ctx.setLineDash([4 / scale, 3 / scale])
        ctx.fillRect(rx, ry, Math.abs(x1 - x0), Math.abs(y1 - y0))
        ctx.strokeRect(rx, ry, Math.abs(x1 - x0), Math.abs(y1 - y0))
      }
      ctx.restore()
    }

    // Report the selection's screen rect so the parent can anchor a context toolbar.
    // Hidden mid-gesture; emitted only when it actually changes (avoids render loops).
    const inGesture = ['move', 'marquee', 'pan', 'pinch'].includes(gesture.current)
    let nextRect: SelectionRect | null = null
    if (selectMode && selSet && !inGesture) {
      const b = strokesBounds(
        selectedIndices.map((i) => strokes[i]).filter(Boolean),
        8,
      )
      if (b) {
        nextRect = { x: b.minX * scale + offsetX, y: b.minY * scale + offsetY, width: (b.maxX - b.minX) * scale, height: (b.maxY - b.minY) * scale }
      }
    }
    const prev = lastSelRect.current
    const changed =
      !prev !== !nextRect ||
      (prev !== null &&
        nextRect !== null &&
        (Math.abs(prev.x - nextRect.x) > 0.5 ||
          Math.abs(prev.y - nextRect.y) > 0.5 ||
          Math.abs(prev.width - nextRect.width) > 0.5 ||
          Math.abs(prev.height - nextRect.height) > 0.5))
    if (changed) {
      lastSelRect.current = nextRect
      onSelectionRect(nextRect)
    }
  }, [strokes, selectMode, selectedIndices, onSelectionRect])

  // Repaint whenever strokes/view change (forceRender drives this on interaction).
  useEffect(() => {
    paint()
  })

  // Size the backing store to the element using devicePixelRatio.
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const resize = () => {
      const dpr = window.devicePixelRatio || 1
      const rect = canvas.getBoundingClientRect()
      canvas.width = Math.round(rect.width * dpr)
      canvas.height = Math.round(rect.height * dpr)
      paint()
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)
    window.addEventListener('resize', resize)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', resize)
    }
  }, [paint])

  // Native wheel listener (passive:false so we can preventDefault to zoom).
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      const rect = canvas.getBoundingClientRect()
      const factor = Math.exp(-e.deltaY * 0.0015)
      zoomAround(e.clientX - rect.left, e.clientY - rect.top, factor)
    }
    canvas.addEventListener('wheel', onWheel, { passive: false })
    return () => canvas.removeEventListener('wheel', onWheel)
  }, [zoomAround])

  // Reset transient state when the committed strokes array is swapped (undo/redo,
  // load, clear) so stale erase indices never apply to a different array.
  useEffect(() => {
    erased.current = new Set()
  }, [strokes])

  // --- Pointer handling ----------------------------------------------------
  const pointFromEvent = (e: React.PointerEvent) => {
    const rect = canvasRef.current!.getBoundingClientRect()
    return { sx: e.clientX - rect.left, sy: e.clientY - rect.top }
  }

  const pressureFor = (e: React.PointerEvent) =>
    e.pointerType === 'pen' && e.pressure > 0 ? e.pressure : 0.5

  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.button === 2) return // right-click is handled by the context menu
    const canvas = canvasRef.current!
    canvas.setPointerCapture(e.pointerId)
    const { sx, sy } = pointFromEvent(e)
    pointers.current.set(e.pointerId, { x: sx, y: sy })

    // Two fingers → pinch zoom/pan; abandon any in-progress single-pointer gesture.
    if (pointers.current.size === 2) {
      const pts = [...pointers.current.values()]
      const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y)
      currentStroke.current = null
      gesture.current = 'pinch'
      pinchStart.current = {
        dist,
        scale: viewRef.current.scale,
        cx: (pts[0].x + pts[1].x) / 2,
        cy: (pts[0].y + pts[1].y) / 2,
        offsetX: viewRef.current.offsetX,
        offsetY: viewRef.current.offsetY,
      }
      return
    }

    const wantPan = panMode || e.button === 1
    if (wantPan) {
      gesture.current = 'pan'
      panStart.current = { x: sx, y: sy, offsetX: viewRef.current.offsetX, offsetY: viewRef.current.offsetY }
      return
    }

    if (selectMode) {
      const world = screenToWorld(sx, sy)
      const hit = hitTopStroke(world.x, world.y)
      if (hit !== -1) {
        // Click a stroke → select it (if not already) and begin moving the selection.
        const already = selectedIndices.includes(hit)
        if (!already) onSelectionChange([hit])
        moveIndices.current = already ? selectedIndices : [hit]
        selectStart.current = world
        moveDelta.current = { dx: 0, dy: 0 }
        moved.current = false
        gesture.current = 'move'
      } else {
        // Empty space → rubber-band marquee.
        marquee.current = { x0: world.x, y0: world.y, x1: world.x, y1: world.y }
        gesture.current = 'marquee'
      }
      requestPaint()
      return
    }

    const world = screenToWorld(sx, sy)
    if (tool === 'eraser') {
      gesture.current = 'erase'
      eraseAt(world.x, world.y)
      return
    }

    gesture.current = 'draw'
    currentStroke.current = { tool, color, size, points: [[world.x, world.y, pressureFor(e)]] }
    requestPaint()
  }

  const eraseAt = (wx: number, wy: number) => {
    const radius = ERASER_RADIUS / viewRef.current.scale
    let changed = false
    for (let i = 0; i < strokes.length; i++) {
      if (erased.current.has(i)) continue
      if (strokeHit(strokes[i], wx, wy, radius)) {
        erased.current.add(i)
        changed = true
      }
    }
    if (changed) requestPaint()
  }

  // Topmost stroke under a world point (iterate front-to-back), or -1.
  const hitTopStroke = (wx: number, wy: number) => {
    const radius = SELECT_RADIUS / viewRef.current.scale
    for (let i = strokes.length - 1; i >= 0; i--) {
      if (strokeHit(strokes[i], wx, wy, radius)) return i
    }
    return -1
  }

  // True if any of the stroke's points fall inside the (normalized) rectangle.
  const strokeInRect = (stroke: Stroke, x0: number, y0: number, x1: number, y1: number) => {
    for (const [x, y] of stroke.points) {
      if (x >= x0 && x <= x1 && y >= y0 && y <= y1) return true
    }
    return false
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!pointers.current.has(e.pointerId)) return
    const { sx, sy } = pointFromEvent(e)
    pointers.current.set(e.pointerId, { x: sx, y: sy })

    if (gesture.current === 'pinch' && pointers.current.size >= 2) {
      const pts = [...pointers.current.values()]
      const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y)
      const cx = (pts[0].x + pts[1].x) / 2
      const cy = (pts[0].y + pts[1].y) / 2
      const start = pinchStart.current
      const next = Math.max(MIN_SCALE, Math.min(MAX_SCALE, start.scale * (dist / start.dist || 1)))
      const ratio = next / start.scale
      viewRef.current = {
        scale: next,
        offsetX: cx - (start.cx - start.offsetX) * ratio,
        offsetY: cy - (start.cy - start.offsetY) * ratio,
      }
      requestPaint()
      return
    }

    if (gesture.current === 'pan') {
      viewRef.current = {
        ...viewRef.current,
        offsetX: panStart.current.offsetX + (sx - panStart.current.x),
        offsetY: panStart.current.offsetY + (sy - panStart.current.y),
      }
      requestPaint()
      return
    }

    if (gesture.current === 'move') {
      const world = screenToWorld(sx, sy)
      moveDelta.current = { dx: world.x - selectStart.current.x, dy: world.y - selectStart.current.y }
      if (Math.hypot(moveDelta.current.dx, moveDelta.current.dy) > 1) moved.current = true
      requestPaint()
      return
    }

    if (gesture.current === 'marquee' && marquee.current) {
      const world = screenToWorld(sx, sy)
      marquee.current = { ...marquee.current, x1: world.x, y1: world.y }
      requestPaint()
      return
    }

    if (gesture.current === 'erase') {
      const world = screenToWorld(sx, sy)
      eraseAt(world.x, world.y)
      return
    }

    if (gesture.current === 'draw' && currentStroke.current) {
      const world = screenToWorld(sx, sy)
      const pts = currentStroke.current.points
      const last = pts[pts.length - 1]
      if (!shouldRecordPoint(last, world.x, world.y)) return
      pts.push([world.x, world.y, pressureFor(e)])
      requestPaint()
    }
  }

  const endPointer = (e: React.PointerEvent) => {
    const canvas = canvasRef.current
    if (canvas?.hasPointerCapture(e.pointerId)) canvas.releasePointerCapture(e.pointerId)
    pointers.current.delete(e.pointerId)

    if (gesture.current === 'draw' && currentStroke.current) {
      const stroke = currentStroke.current
      currentStroke.current = null
      if (stroke.points.length > 0) onCommitStroke(stroke)
    } else if (gesture.current === 'erase') {
      const removed = [...erased.current]
      if (removed.length > 0) onEraseStrokes(removed)
      erased.current = new Set()
    } else if (gesture.current === 'move') {
      if (moved.current) onMoveStrokes(moveIndices.current, moveDelta.current.dx, moveDelta.current.dy)
      moveDelta.current = { dx: 0, dy: 0 }
    } else if (gesture.current === 'marquee' && marquee.current) {
      const { x0, y0, x1, y1 } = marquee.current
      const rx0 = Math.min(x0, x1)
      const ry0 = Math.min(y0, y1)
      const rx1 = Math.max(x0, x1)
      const ry1 = Math.max(y0, y1)
      const scale = viewRef.current.scale
      if (rx1 - rx0 < 3 / scale && ry1 - ry0 < 3 / scale) {
        // A click on empty space clears the selection.
        onSelectionChange([])
      } else {
        const sel: number[] = []
        for (let i = 0; i < strokes.length; i++) {
          if (strokeInRect(strokes[i], rx0, ry0, rx1, ry1)) sel.push(i)
        }
        onSelectionChange(sel)
      }
      marquee.current = null
    }

    // Settle remaining pointers: one left → it's a fresh single gesture next move.
    if (pointers.current.size === 0) gesture.current = 'idle'
    else if (pointers.current.size === 1 && gesture.current === 'pinch') gesture.current = 'idle'
    requestPaint()
  }

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    const rect = canvasRef.current!.getBoundingClientRect()
    const sx = e.clientX - rect.left
    const sy = e.clientY - rect.top
    const world = screenToWorld(sx, sy)
    const hit = hitTopStroke(world.x, world.y)
    onContextMenu({ x: sx, y: sy, worldX: world.x, worldY: world.y, onStroke: hit !== -1, hitIndex: hit })
  }

  const cursor = selectMode
    ? gesture.current === 'move'
      ? 'grabbing'
      : 'default'
    : panMode
      ? 'grab'
      : tool === 'eraser'
        ? 'cell'
        : 'crosshair'

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 h-full w-full touch-none select-none"
      style={{ cursor }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={endPointer}
      onPointerCancel={endPointer}
      onContextMenu={handleContextMenu}
    />
  )
})

export { TOOL_PRESETS }
