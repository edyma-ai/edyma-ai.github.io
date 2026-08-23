// One piece of chapter content floating over the board canvas: draggable by its
// header, resizable from the bottom-right corner, and collapsible to a pill so
// the drawing underneath stays reachable. The board owns which item is open;
// this component owns only where the panel sits.
import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent, type ReactNode } from 'react'
import { ChevronUp, ExternalLink, FileText, Film, Minus, X, Zap } from 'react-feather'
import { useNavigate } from 'react-router-dom'
import { ChapterVideoCard } from '@/components/classroom/ChapterVideoCard'
import { InteractiveEmbed } from '@/components/classroom/InteractiveEmbed'
import { MarkdownContent } from '@/components/present/MarkdownContent'
import type { BoardContext } from '@/lib/boards'
import type { ChapterVideo } from '@/lib/classroom'
import type { TlmSection } from '@/lib/presentations'
import { cn } from '@/lib/cn'

/** Anything the content drawer can throw onto the board, with the chapter it came from. */
export type BoardContentItem =
  | { kind: 'video'; id: string; title: string; context: BoardContext; video: ChapterVideo }
  | { kind: 'interactive'; id: string; title: string; context: BoardContext }
  | { kind: 'guide'; id: string; title: string; context: BoardContext; sections: TlmSection[] }

interface Frame {
  x: number
  y: number
  width: number
  height: number
}

const MIN_WIDTH = 280
const MIN_HEIGHT = 200
const TOP_BAR_GAP = 64 // clears the board's top bar
const BOTTOM_BAR_GAP = 84 // clears the floating tool palette
const NARROW_VIEWPORT = 768

/** Right half on a desktop, bottom 60% on a phone. */
function initialFrame(): Frame {
  const viewportWidth = window.innerWidth
  const viewportHeight = window.innerHeight
  if (viewportWidth < NARROW_VIEWPORT) {
    const height = Math.max(MIN_HEIGHT, Math.round(viewportHeight * 0.6))
    return { x: 0, y: Math.max(0, viewportHeight - height), width: viewportWidth, height }
  }
  const width = Math.max(MIN_WIDTH, Math.round(viewportWidth / 2) - 16)
  const height = Math.max(MIN_HEIGHT, viewportHeight - TOP_BAR_GAP - BOTTOM_BAR_GAP)
  return { x: viewportWidth - width - 12, y: TOP_BAR_GAP, width, height }
}

/** Keeps the panel inside the viewport after a drag, a resize or a window change. */
function clampFrame(frame: Frame): Frame {
  const viewportWidth = window.innerWidth
  const viewportHeight = window.innerHeight
  const width = Math.min(Math.max(frame.width, MIN_WIDTH), viewportWidth)
  const height = Math.min(Math.max(frame.height, MIN_HEIGHT), viewportHeight)
  return {
    width,
    height,
    x: Math.min(Math.max(frame.x, 0), Math.max(0, viewportWidth - width)),
    y: Math.min(Math.max(frame.y, 0), Math.max(0, viewportHeight - height)),
  }
}

function ItemIcon({ kind }: { kind: BoardContentItem['kind'] }) {
  if (kind === 'video') return <Film size={15} className="shrink-0 text-primary" />
  if (kind === 'interactive') return <Zap size={15} className="shrink-0 text-primary" />
  return <FileText size={15} className="shrink-0 text-primary" />
}

export function ContentPanel({ item, onClose }: { item: BoardContentItem; onClose: () => void }) {
  const navigate = useNavigate()
  const [frame, setFrame] = useState<Frame>(() => clampFrame(initialFrame()))
  // Minimising is remembered per item, so opening another one brings the panel back.
  const [minimisedId, setMinimisedId] = useState<string | null>(null)
  const gesture = useRef<{ pointerId: number; startX: number; startY: number; origin: Frame; mode: 'move' | 'resize' } | null>(null)

  const minimised = minimisedId === item.id

  useEffect(() => {
    const onResize = () => setFrame((current) => clampFrame(current))
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const beginGesture = useCallback(
    (mode: 'move' | 'resize') => (event: ReactPointerEvent<HTMLElement>) => {
      if (event.pointerType === 'mouse' && event.button !== 0) return
      event.currentTarget.setPointerCapture(event.pointerId)
      gesture.current = { pointerId: event.pointerId, startX: event.clientX, startY: event.clientY, origin: frame, mode }
    },
    [frame],
  )

  const continueGesture = useCallback((event: ReactPointerEvent<HTMLElement>) => {
    const active = gesture.current
    if (!active || active.pointerId !== event.pointerId) return
    const dx = event.clientX - active.startX
    const dy = event.clientY - active.startY
    setFrame(
      clampFrame(
        active.mode === 'move'
          ? { ...active.origin, x: active.origin.x + dx, y: active.origin.y + dy }
          : { ...active.origin, width: active.origin.width + dx, height: active.origin.height + dy },
      ),
    )
  }, [])

  const endGesture = useCallback((event: ReactPointerEvent<HTMLElement>) => {
    if (gesture.current && gesture.current.pointerId === event.pointerId) gesture.current = null
  }, [])

  // A video or a sim reopens on the chapter page's matching tab; a study guide
  // reopens in the annotatable reader.
  const openFull = useCallback(() => {
    const { classId, subjectId, chapterId } = item.context
    if (item.kind === 'guide') {
      navigate(`/teacher/${classId}/${subjectId}/${chapterId}/tlm/${item.id}`)
      return
    }
    navigate(`/teacher/${classId}/${subjectId}/${chapterId}?tab=${item.kind === 'video' ? 'videos' : 'interactive'}`)
  }, [item, navigate])

  if (minimised) {
    return (
      <button
        type="button"
        onClick={() => setMinimisedId(null)}
        title="Restore content panel"
        className="pointer-events-auto absolute bottom-3 right-3 z-30 inline-flex max-w-[70vw] items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 text-sm font-medium text-fg shadow-xl transition-colors hover:border-primary/40"
      >
        <ItemIcon kind={item.kind} />
        <span className="truncate">{item.title}</span>
        <ChevronUp size={15} className="shrink-0 text-muted" />
      </button>
    )
  }

  return (
    <section
      aria-label={item.title}
      className="pointer-events-auto absolute z-30 flex flex-col overflow-hidden rounded-2xl border border-border bg-bg shadow-2xl"
      style={{ left: frame.x, top: frame.y, width: frame.width, height: frame.height }}
    >
      <header className="flex items-center gap-1 border-b border-border bg-surface pr-1">
        <div
          onPointerDown={beginGesture('move')}
          onPointerMove={continueGesture}
          onPointerUp={endGesture}
          onPointerCancel={endGesture}
          className="flex min-w-0 flex-1 cursor-move touch-none items-center gap-2 px-4 py-3"
        >
          <ItemIcon kind={item.kind} />
          <p className="min-w-0 flex-1 truncate text-sm font-semibold text-fg">{item.title}</p>
        </div>
        <PanelButton onClick={openFull} label="Open full">
          <ExternalLink size={16} />
        </PanelButton>
        <PanelButton onClick={() => setMinimisedId(item.id)} label="Minimise">
          <Minus size={16} />
        </PanelButton>
        <PanelButton onClick={onClose} label="Close content">
          <X size={16} />
        </PanelButton>
      </header>

      <div className={cn('min-h-0 flex-1 overflow-y-auto', item.kind === 'guide' ? 'px-5 py-4' : 'p-4')}>
        {item.kind === 'video' ? <ChapterVideoCard video={item.video} /> : null}
        {item.kind === 'interactive' ? <InteractiveEmbed elementId={item.id} allowFullscreen /> : null}
        {item.kind === 'guide' ? (
          <>
            <h1 className="markdown-doc-title">{item.title}</h1>
            <MarkdownContent markdown={item.sections.map((section) => `## ${section.heading}\n\n${section.content}`).join('\n\n---\n\n')} variant="presentation" />
          </>
        ) : null}
      </div>

      <div
        onPointerDown={beginGesture('resize')}
        onPointerMove={continueGesture}
        onPointerUp={endGesture}
        onPointerCancel={endGesture}
        role="separator"
        aria-label="Resize content panel"
        className="absolute bottom-0 right-0 h-5 w-5 cursor-nwse-resize touch-none"
      >
        <span className="absolute bottom-1.5 right-1.5 h-2.5 w-2.5 border-b-2 border-r-2 border-muted/60" />
      </div>
    </section>
  )
}

function PanelButton({ onClick, label, children }: { onClick: () => void; label: string; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-muted transition-colors hover:bg-primary-muted hover:text-primary"
    >
      {children}
    </button>
  )
}
