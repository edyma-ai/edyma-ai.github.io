// Freehand annotation over a scrolling document. Unlike the boards canvas
// (a pan/zoom world), this layer is pinned to the reader: it covers the
// content wrapper exactly, and strokes are stored in document coordinates
// (CSS px from the wrapper's top-left) so they scroll with the text and land
// back on the same words on any display at the same content width.
import { useCallback, useEffect, useRef, useState } from 'react'
import type { Stroke } from '@/lib/boards'
import { paintStroke, shouldRecordPoint, strokeHit } from '@/lib/strokes'

export type AnnotationTool = 'pen' | 'highlighter' | 'eraser'

/** Hit tolerance for the eraser, in document px. */
const ERASER_RADIUS = 6

interface AnnotationLayerProps {
  strokes: Stroke[]
  /** null means "reading": the layer lets clicks, selection and scrolling through. */
  tool: AnnotationTool | null
  color: string
  size: number
  onCommitStroke: (stroke: Stroke) => void
  onEraseStrokes: (indices: number[]) => void
}

export function AnnotationLayer({ strokes, tool, color, size, onCommitStroke, onEraseStrokes }: AnnotationLayerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const currentStroke = useRef<Stroke | null>(null)
  const erased = useRef<Set<number>>(new Set())
  const drawing = useRef(false)
  const [, forceRender] = useState(0)
  const requestPaint = useCallback(() => forceRender((n) => n + 1), [])

  const paint = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const dpr = window.devicePixelRatio || 1

    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

    for (let i = 0; i < strokes.length; i++) {
      if (erased.current.has(i)) continue
      paintStroke(ctx, strokes[i])
    }
    if (currentStroke.current) paintStroke(ctx, currentStroke.current)
  }, [strokes])

  // Repaint after every render (drawing drives this through requestPaint).
  useEffect(() => {
    paint()
  })

  // The canvas is stretched over the wrapper, so its own box is the document
  // box: observing it covers content growth, resizes and zoom changes alike.
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
    const observer = new ResizeObserver(resize)
    observer.observe(canvas)
    window.addEventListener('resize', resize)
    return () => {
      observer.disconnect()
      window.removeEventListener('resize', resize)
    }
  }, [paint])

  // A new strokes array (load, undo, clear) invalidates pending erase indices.
  useEffect(() => {
    erased.current = new Set()
  }, [strokes])

  const pointFromEvent = (event: React.PointerEvent) => {
    const rect = canvasRef.current!.getBoundingClientRect()
    return { x: event.clientX - rect.left, y: event.clientY - rect.top }
  }

  const pressureFor = (event: React.PointerEvent) =>
    event.pointerType === 'pen' && event.pressure > 0 ? event.pressure : 0.5

  const eraseAt = (x: number, y: number) => {
    let changed = false
    for (let i = 0; i < strokes.length; i++) {
      if (erased.current.has(i)) continue
      if (strokeHit(strokes[i], x, y, ERASER_RADIUS)) {
        erased.current.add(i)
        changed = true
      }
    }
    if (changed) requestPaint()
  }

  const handlePointerDown = (event: React.PointerEvent) => {
    if (!tool || event.button === 2) return
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.setPointerCapture(event.pointerId)
    drawing.current = true
    const { x, y } = pointFromEvent(event)

    if (tool === 'eraser') {
      eraseAt(x, y)
      return
    }
    currentStroke.current = { tool, color, size, points: [[x, y, pressureFor(event)]] }
    requestPaint()
  }

  const handlePointerMove = (event: React.PointerEvent) => {
    if (!drawing.current || !tool) return
    const { x, y } = pointFromEvent(event)

    if (tool === 'eraser') {
      eraseAt(x, y)
      return
    }
    const stroke = currentStroke.current
    if (!stroke) return
    const last = stroke.points[stroke.points.length - 1]
    if (!shouldRecordPoint(last, x, y)) return
    stroke.points.push([x, y, pressureFor(event)])
    requestPaint()
  }

  const endPointer = (event: React.PointerEvent) => {
    if (!drawing.current) return
    drawing.current = false
    const canvas = canvasRef.current
    if (canvas?.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId)

    const stroke = currentStroke.current
    if (stroke) {
      currentStroke.current = null
      if (stroke.points.length > 0) onCommitStroke(stroke)
    }
    const removed = [...erased.current]
    if (removed.length > 0) {
      erased.current = new Set()
      onEraseStrokes(removed)
    }
    requestPaint()
  }

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 h-full w-full select-none"
      style={{
        pointerEvents: tool ? 'auto' : 'none',
        touchAction: tool ? 'none' : 'auto',
        cursor: tool === 'eraser' ? 'cell' : 'crosshair',
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={endPointer}
      onPointerCancel={endPointer}
    />
  )
}
