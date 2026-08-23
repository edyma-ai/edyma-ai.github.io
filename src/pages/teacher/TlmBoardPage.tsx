// Full-bleed reader for a shared study guide, with a freehand annotation layer
// on top. The reader mirrors the public presentation view (same markdown
// pipeline, same light/dark preference) so what the class sees on the wall is
// what the teacher marks up.
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ChevronLeft, Maximize, Minimize } from 'react-feather'
import { AnnotationLayer, type AnnotationTool } from '@/components/classroom/AnnotationLayer'
import { AnnotationToolbar, type AnnotationSaveState } from '@/components/classroom/AnnotationToolbar'
import { MarkdownContent } from '@/components/present/MarkdownContent'
import { PresentationThemeToggle } from '@/components/present/PresentationThemeToggle'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { Spinner } from '@/components/ui/Spinner'
import { useApiData } from '@/hooks/useApiData'
import type { Stroke } from '@/lib/boards'
import { fetchAnnotations, fetchStudyGuides, saveAnnotations, type StudyGuide } from '@/lib/classroom'
import { cn } from '@/lib/cn'
import { TOOL_PRESETS } from '@/lib/strokes'

type ReaderTheme = 'light' | 'dark'

const THEME_KEY = 'edyma-present-theme'
const SAVE_DEBOUNCE_MS = 800

function readTheme(): ReaderTheme {
  if (typeof window === 'undefined') return 'light'
  return localStorage.getItem(THEME_KEY) === 'dark' ? 'dark' : 'light'
}

export function TlmBoardPage() {
  const { classId = '', subjectId = '', chapterId = '', tlmId = '' } = useParams()

  const load = useCallback(async () => {
    const [guides, annotations] = await Promise.all([fetchStudyGuides(chapterId), fetchAnnotations(tlmId)])
    return { guide: guides.find((item) => item.tlm_id === tlmId) ?? null, strokes: annotations.strokes }
  }, [chapterId, tlmId])

  const board = useApiData(load)
  const backTo = `/teacher/${classId}/${subjectId}/${chapterId}`

  if (board.loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner size="lg" className="text-primary" />
      </div>
    )
  }

  if (board.error || !board.data) {
    return <ErrorState title="Couldn't load this study guide" message={board.error ?? undefined} onRetry={board.reload} />
  }

  if (!board.data.guide) {
    return (
      <EmptyState
        title="Study guide not available"
        description="It is no longer shared with a section you teach."
      />
    )
  }

  return <TlmReader tlmId={tlmId} guide={board.data.guide} initialStrokes={board.data.strokes} backTo={backTo} />
}

function TlmReader({
  tlmId,
  guide,
  initialStrokes,
  backTo,
}: {
  tlmId: string
  guide: StudyGuide
  initialStrokes: Stroke[]
  backTo: string
}) {
  const rootRef = useRef<HTMLDivElement>(null)
  const [strokes, setStrokes] = useState<Stroke[]>(initialStrokes)
  const [past, setPast] = useState<Stroke[][]>([])
  const [future, setFuture] = useState<Stroke[][]>([])
  const [tool, setTool] = useState<AnnotationTool | null>(null)
  const [color, setColor] = useState('#ef4444')
  const [size, setSize] = useState(TOOL_PRESETS.pen.defaultSize)
  const [saveState, setSaveState] = useState<AnnotationSaveState>('saved')
  const [theme, setTheme] = useState<ReaderTheme>(() => readTheme())
  const [isFullscreen, setIsFullscreen] = useState(false)

  const markdown = useMemo(
    () => guide.sections.map((section) => `## ${section.heading}\n\n${section.content}`).join('\n\n---\n\n'),
    [guide.sections],
  )

  // --- history + mutations (each one pushes a single undo step) -------------
  const pushHistory = useCallback(() => {
    setPast((history) => [...history, strokes])
    setFuture([])
    setSaveState('unsaved')
  }, [strokes])

  const commitStroke = useCallback(
    (stroke: Stroke) => {
      pushHistory()
      setStrokes((current) => [...current, stroke])
    },
    [pushHistory],
  )

  const eraseStrokes = useCallback(
    (indices: number[]) => {
      const removed = new Set(indices)
      pushHistory()
      setStrokes((current) => current.filter((_, index) => !removed.has(index)))
    },
    [pushHistory],
  )

  const clearStrokes = useCallback(() => {
    pushHistory()
    setStrokes([])
  }, [pushHistory])

  const undo = useCallback(() => {
    setPast((history) => {
      if (history.length === 0) return history
      setFuture((upcoming) => [strokes, ...upcoming])
      setStrokes(history[history.length - 1])
      setSaveState('unsaved')
      return history.slice(0, -1)
    })
  }, [strokes])

  const redo = useCallback(() => {
    setFuture((upcoming) => {
      if (upcoming.length === 0) return upcoming
      setPast((history) => [...history, strokes])
      setStrokes(upcoming[0])
      setSaveState('unsaved')
      return upcoming.slice(1)
    })
  }, [strokes])

  // --- persistence ---------------------------------------------------------
  const persist = useCallback(
    async (pending: Stroke[]) => {
      setSaveState('saving')
      try {
        await saveAnnotations(tlmId, pending)
        // A stroke drawn while the request was in flight leaves the state
        // dirty, and the debounce below schedules the next write.
        setSaveState((current) => (current === 'saving' ? 'saved' : current))
      } catch {
        // Over the server's size caps (413/422) or offline: the marks stay on
        // screen and every later edit retries the write.
        setSaveState('error')
      }
    },
    [tlmId],
  )

  useEffect(() => {
    if (saveState !== 'unsaved') return
    const timer = window.setTimeout(() => void persist(strokes), SAVE_DEBOUNCE_MS)
    return () => window.clearTimeout(timer)
  }, [saveState, strokes, persist])

  // Latest values for the unload flush, which cannot depend on render timing.
  const strokesRef = useRef(strokes)
  const saveStateRef = useRef(saveState)
  useEffect(() => {
    strokesRef.current = strokes
    saveStateRef.current = saveState
  })

  // Leaving with unsaved marks: attempt the write anyway. `sendBeacon` cannot
  // carry the bearer header, so this is a keepalive fetch and best effort.
  useEffect(() => {
    const flush = () => {
      if (saveStateRef.current === 'saved') return
      void saveAnnotations(tlmId, strokesRef.current, { keepalive: true }).catch(() => {})
    }
    window.addEventListener('beforeunload', flush)
    return () => {
      window.removeEventListener('beforeunload', flush)
      flush()
    }
  }, [tlmId])

  // Each tool carries its own sensible brush size (a highlighter is fat).
  const changeTool = useCallback((next: AnnotationTool | null) => {
    setTool(next)
    if (next === 'pen' || next === 'highlighter') setSize(TOOL_PRESETS[next].defaultSize)
  }, [])

  // --- presentation controls ----------------------------------------------
  const toggleTheme = useCallback(() => {
    setTheme((current) => {
      const next: ReaderTheme = current === 'dark' ? 'light' : 'dark'
      localStorage.setItem(THEME_KEY, next)
      return next
    })
  }, [])

  useEffect(() => {
    const onChange = () => setIsFullscreen(Boolean(document.fullscreenElement))
    document.addEventListener('fullscreenchange', onChange)
    return () => document.removeEventListener('fullscreenchange', onChange)
  }, [])

  const toggleFullscreen = useCallback(() => {
    const root = rootRef.current
    if (!root) return
    if (document.fullscreenElement) void document.exitFullscreen?.()
    else void root.requestFullscreen?.().catch(() => {})
  }, [])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) return
      if (event.key === 'Escape') {
        setTool(null)
        return
      }
      if (event.key.toLowerCase() === 'f' && !event.metaKey && !event.ctrlKey && !event.altKey) {
        event.preventDefault()
        toggleFullscreen()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [toggleFullscreen])

  return (
    <div ref={rootRef} className={cn('relative min-h-screen bg-bg', theme === 'light' && 'present-theme-light')}>
      <div className="mx-auto flex w-full max-w-[960px] items-center gap-3 px-8 pt-5">
        <Link
          to={backTo}
          className="inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-fg"
        >
          <ChevronLeft size={16} />
          Chapter
        </Link>
        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            onClick={toggleFullscreen}
            aria-label={isFullscreen ? 'Exit full screen' : 'Full screen'}
            title={isFullscreen ? 'Exit full screen (F)' : 'Full screen (F)'}
            className="rounded-full border border-border bg-surface p-3 text-fg shadow-lg transition-colors hover:bg-surface-hover"
          >
            {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
          </button>
          <PresentationThemeToggle theme={theme} onToggle={toggleTheme} floating={false} />
        </div>
      </div>

      <div className="relative mx-auto w-full max-w-[960px] px-8 pt-4 pb-32">
        <h1 className="markdown-doc-title">{guide.title}</h1>
        <MarkdownContent markdown={markdown} variant="presentation" />
        <AnnotationLayer
          strokes={strokes}
          tool={tool}
          color={color}
          size={size}
          onCommitStroke={commitStroke}
          onEraseStrokes={eraseStrokes}
        />
      </div>

      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-30 flex justify-center p-3">
        <AnnotationToolbar
          tool={tool}
          onToolChange={changeTool}
          color={color}
          onColorChange={setColor}
          size={size}
          onSizeChange={setSize}
          canUndo={past.length > 0}
          canRedo={future.length > 0}
          onUndo={undo}
          onRedo={redo}
          hasStrokes={strokes.length > 0}
          onClear={clearStrokes}
          saveState={saveState}
        />
      </div>
    </div>
  )
}
