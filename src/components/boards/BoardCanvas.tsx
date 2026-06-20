// The drawing surface: an HTML5 canvas with pointer-driven freehand input,
// pan/zoom, DPR-crisp rendering, and stroke-level erasing. Committed strokes are
// owned by the parent (BoardEditorPage) so undo/redo and autosave live there;
// this component only manages the in-progress stroke, the pending-erase set, and
// the view transform (pan/zoom), none of which are persisted.
import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react'
import type { Stroke, ToolKind } from '@/lib/boards'
import { TOOL_PRESETS, paintStroke, strokeHit } from '@/lib/strokes'

export interface BoardCanvasHandle {
  resetView: () => void
  zoomBy: (factor: number) => void
}

interface BoardCanvasProps {
  strokes: Stroke[]
  tool: ToolKind
  color: string
  size: number
  /** Hand tool — pointer drags pan instead of draw. */
  panMode: boolean
  onCommitStroke: (stroke: Stroke) => void
  onEraseStrokes: (removeIndices: number[]) => void
}

interface View {
  scale: number
  offsetX: number
  offsetY: number
}

const MIN_SCALE = 0.2
const MAX_SCALE = 8
const ERASER_RADIUS = 6 // screen px tolerance, scaled to world at hit-test time

export const BoardCanvas = forwardRef<BoardCanvasHandle, BoardCanvasProps>(function BoardCanvas(
  { strokes, tool, color, size, panMode, onCommitStroke, onEraseStrokes },
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
  const gesture = useRef<'idle' | 'draw' | 'erase' | 'pan' | 'pinch'>('idle')
  const panStart = useRef({ x: 0, y: 0, offsetX: 0, offsetY: 0 })
  const pinchStart = useRef({ dist: 0, scale: 1, cx: 0, cy: 0, offsetX: 0, offsetY: 0 })

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

    for (let i = 0; i < strokes.length; i++) {
      if (erased.current.has(i)) continue
      paintStroke(ctx, strokes[i])
    }
    if (currentStroke.current) paintStroke(ctx, currentStroke.current)
  }, [strokes])

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

    if (gesture.current === 'erase') {
      const world = screenToWorld(sx, sy)
      eraseAt(world.x, world.y)
      return
    }

    if (gesture.current === 'draw' && currentStroke.current) {
      const world = screenToWorld(sx, sy)
      const pts = currentStroke.current.points
      const last = pts[pts.length - 1]
      // Downsample: skip points closer than ~1.5 world px to keep storage lean.
      if (Math.hypot(world.x - last[0], world.y - last[1]) < 1.5) return
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
    }

    // Settle remaining pointers: one left → it's a fresh single gesture next move.
    if (pointers.current.size === 0) gesture.current = 'idle'
    else if (pointers.current.size === 1 && gesture.current === 'pinch') gesture.current = 'idle'
    requestPaint()
  }

  const cursor = panMode ? 'grab' : tool === 'eraser' ? 'cell' : 'crosshair'

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 h-full w-full touch-none select-none"
      style={{ cursor }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={endPointer}
      onPointerCancel={endPointer}
    />
  )
})

export { TOOL_PRESETS }
