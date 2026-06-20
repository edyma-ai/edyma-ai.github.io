import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ChevronLeft, Download, Moon, Save, Sun, Trash2 } from 'react-feather'
import { Navigate, useNavigate, useParams } from 'react-router-dom'

import { BoardCanvas, type BoardCanvasHandle } from '@/components/boards/BoardCanvas'
import { BoardToolbar } from '@/components/boards/BoardToolbar'
import { TitlePromptModal } from '@/components/boards/TitlePromptModal'
import { BoardsQuotaError, type Board, type Stroke, type ToolKind, deleteBoard, getBoard, upsertBoard } from '@/lib/boards'
import { TOOL_PRESETS, paintStroke, strokesBounds } from '@/lib/strokes'
import { cn } from '@/lib/cn'

type Theme = 'light' | 'dark'
type SaveState = 'unsaved' | 'saving' | 'saved'

const THEME_KEY = 'edyma-present-theme'

function readTheme(): Theme {
  if (typeof window === 'undefined') return 'light'
  return localStorage.getItem(THEME_KEY) === 'dark' ? 'dark' : 'light'
}

export function BoardEditorPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const initial = useMemo(() => (id ? getBoard(id) : undefined), [id])

  if (!initial) return <Navigate to="/boards" replace />
  return <Editor board={initial} onBack={() => navigate('/boards')} />
}

function Editor({ board, onBack }: { board: Board; onBack: () => void }) {
  const canvasRef = useRef<BoardCanvasHandle>(null)

  const [strokes, setStrokes] = useState<Stroke[]>(board.strokes)
  const [past, setPast] = useState<Stroke[][]>([])
  const [future, setFuture] = useState<Stroke[][]>([])

  const [tool, setTool] = useState<ToolKind>('pen')
  const [color, setColor] = useState('#0f172a')
  const [size, setSize] = useState(TOOL_PRESETS.pen.defaultSize)
  const [panMode, setPanMode] = useState(false)

  const [title, setTitle] = useState(board.title)
  const [saveState, setSaveState] = useState<SaveState>(board.title.trim() ? 'saved' : 'unsaved')
  const [theme, setTheme] = useState<Theme>(() => readTheme())
  const [showTitlePrompt, setShowTitlePrompt] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const mounted = useRef(false)

  // A board becomes "saved" once it has a title; until then it stays a local,
  // unsaved draft and the user must save explicitly (Save button / Ctrl+S).
  const isSaved = title.trim().length > 0

  // --- mutations (each pushes one undo step) -------------------------------
  // Until the board is saved, edits stay "unsaved"; afterwards autosave kicks in.
  const markDirty = useCallback(() => setSaveState(isSaved ? 'saving' : 'unsaved'), [isSaved])

  const pushHistory = useCallback(() => {
    setPast((p) => [...p, strokes])
    setFuture([])
    markDirty()
  }, [strokes, markDirty])

  const commitStroke = useCallback(
    (stroke: Stroke) => {
      pushHistory()
      setStrokes((s) => [...s, stroke])
    },
    [pushHistory],
  )

  const eraseStrokes = useCallback(
    (removeIndices: number[]) => {
      const remove = new Set(removeIndices)
      pushHistory()
      setStrokes((s) => s.filter((_, i) => !remove.has(i)))
    },
    [pushHistory],
  )

  const clearBoard = useCallback(() => {
    if (strokes.length === 0) return
    if (!window.confirm('Clear the entire board? This can be undone.')) return
    pushHistory()
    setStrokes([])
  }, [strokes.length, pushHistory])

  const undo = useCallback(() => {
    setPast((p) => {
      if (p.length === 0) return p
      const prev = p[p.length - 1]
      setFuture((f) => [strokes, ...f])
      setStrokes(prev)
      markDirty()
      return p.slice(0, -1)
    })
  }, [strokes, markDirty])

  const redo = useCallback(() => {
    setFuture((f) => {
      if (f.length === 0) return f
      const next = f[0]
      setPast((p) => [...p, strokes])
      setStrokes(next)
      markDirty()
      return f.slice(1)
    })
  }, [strokes, markDirty])

  // Persist immediately with an explicit title. Used for the first manual save
  // and any forced save (Ctrl+S). Returns whether it succeeded.
  const persist = useCallback(
    (nextTitle: string): boolean => {
      try {
        upsertBoard({ ...board, title: nextTitle.trim(), strokes, updatedAt: Date.now() })
        setSaveState('saved')
        setError(null)
        return true
      } catch (err) {
        setError(err instanceof BoardsQuotaError ? err.message : 'Could not save board.')
        return false
      }
    },
    [board, strokes],
  )

  // Manual save. The first time (untitled draft) this opens the title prompt;
  // afterwards it just force-saves the current state.
  const saveNow = useCallback(() => {
    if (!isSaved) {
      setShowTitlePrompt(true)
      return
    }
    persist(title)
  }, [isSaved, persist, title])

  // Delete this board and return to the list.
  const deleteBoardNow = useCallback(() => {
    const label = title.trim() || 'this untitled board'
    if (!window.confirm(`Delete "${label}"? This cannot be undone.`)) return
    deleteBoard(board.id)
    onBack()
  }, [title, board.id, onBack])

  // Keyboard shortcuts: undo/redo and save.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey
      if (!mod) return
      const key = e.key.toLowerCase()
      if (key === 's') {
        e.preventDefault() // suppress the browser's "save page" dialog
        saveNow()
      } else if (key === 'z' && !e.shiftKey) {
        e.preventDefault()
        undo()
      } else if ((key === 'z' && e.shiftKey) || key === 'y') {
        e.preventDefault()
        redo()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [undo, redo, saveNow])

  // Debounced autosave — only active once the board has been saved (has a title).
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true
      return
    }
    if (!isSaved) return
    const t = window.setTimeout(() => persist(title), 600)
    return () => window.clearTimeout(t)
  }, [strokes, title, isSaved, persist])

  const toggleTheme = useCallback(() => {
    setTheme((cur) => {
      const next: Theme = cur === 'dark' ? 'light' : 'dark'
      localStorage.setItem(THEME_KEY, next)
      return next
    })
  }, [])

  const handleToolChange = useCallback((t: ToolKind) => {
    setPanMode(false)
    setTool(t)
    if (t !== 'eraser') setSize(TOOL_PRESETS[t].defaultSize)
  }, [])

  const exportPng = useCallback(() => {
    const bounds = strokesBounds(strokes)
    if (!bounds) {
      setError('Nothing to export yet.')
      return
    }
    const w = Math.max(1, Math.ceil(bounds.maxX - bounds.minX))
    const h = Math.max(1, Math.ceil(bounds.maxY - bounds.minY))
    const canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.fillStyle = theme === 'dark' ? '#0f172a' : '#ffffff'
    ctx.fillRect(0, 0, w, h)
    ctx.translate(-bounds.minX, -bounds.minY)
    for (const stroke of strokes) paintStroke(ctx, stroke)
    canvas.toBlob((blob) => {
      if (!blob) return
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${(title.trim() || 'board').replace(/[^\w-]+/g, '_')}.png`
      a.click()
      URL.revokeObjectURL(url)
    }, 'image/png')
  }, [strokes, title, theme])

  return (
    <div className={cn('relative h-screen w-screen overflow-hidden bg-bg', theme === 'light' && 'present-theme-light')}>
      <BoardCanvas
        ref={canvasRef}
        strokes={strokes}
        tool={tool}
        color={color}
        size={size}
        panMode={panMode}
        onCommitStroke={commitStroke}
        onEraseStrokes={eraseStrokes}
      />

      {/* Top bar */}
      <div className="pointer-events-none absolute inset-x-0 top-0 flex items-center gap-3 p-3">
        <button
          type="button"
          onClick={onBack}
          className="pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface text-fg shadow-lg transition-colors hover:bg-surface-hover"
          aria-label="Back to boards"
          title="Back to boards"
        >
          <ChevronLeft size={20} />
        </button>

        {isSaved ? (
          // Saved board: title is editable and edits autosave.
          <input
            value={title}
            onChange={(e) => {
              setTitle(e.target.value)
              markDirty()
            }}
            placeholder="Untitled board"
            aria-label="Board title"
            className="pointer-events-auto min-w-0 max-w-xs flex-1 rounded-lg border border-transparent bg-surface px-3 py-2 font-medium text-fg shadow-lg outline-none transition-colors placeholder:text-muted hover:border-border focus:border-primary sm:flex-none sm:w-72"
          />
        ) : (
          // Unsaved draft: show a static label until the user saves for the first time.
          <span className="pointer-events-none rounded-lg bg-surface px-3 py-2 font-medium text-muted shadow-lg">
            Untitled board
          </span>
        )}

        <span
          className={cn(
            'pointer-events-none hidden items-center gap-1.5 text-xs sm:inline-flex',
            saveState === 'saved' ? 'text-muted' : 'text-amber-500',
          )}
        >
          <span
            className={cn(
              'h-1.5 w-1.5 rounded-full',
              saveState === 'saving' ? 'animate-pulse bg-amber-500' : saveState === 'saved' ? 'bg-emerald-500' : 'bg-amber-500',
            )}
          />
          {saveState === 'saving' ? 'Saving…' : saveState === 'saved' ? 'Saved' : 'Unsaved'}
        </span>

        <div className="ml-auto flex items-center gap-2">
          {error ? <span className="pointer-events-none hidden text-xs text-red-400 sm:inline">{error}</span> : null}
          {!isSaved ? (
            <button
              type="button"
              onClick={saveNow}
              className="pointer-events-auto flex h-10 items-center gap-2 rounded-full bg-primary px-4 text-sm font-semibold text-primary-fg shadow-lg transition-colors hover:bg-primary-hover"
              aria-label="Save board"
              title="Save board (Ctrl/Cmd+S)"
            >
              <Save size={18} />
              Save
            </button>
          ) : null}
          <button
            type="button"
            onClick={exportPng}
            className="pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface text-fg shadow-lg transition-colors hover:bg-surface-hover"
            aria-label="Export as PNG"
            title="Export as PNG"
          >
            <Download size={20} />
          </button>
          <button
            type="button"
            onClick={toggleTheme}
            className="pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface text-fg shadow-lg transition-colors hover:bg-surface-hover"
            aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
            title={theme === 'dark' ? 'Light theme' : 'Dark theme'}
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button
            type="button"
            onClick={deleteBoardNow}
            className="pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface text-muted shadow-lg transition-colors hover:border-red-400/40 hover:bg-red-500/10 hover:text-red-400"
            aria-label="Delete board"
            title="Delete board"
          >
            <Trash2 size={20} />
          </button>
        </div>
      </div>

      {/* Bottom toolbar */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center p-3">
        <BoardToolbar
          tool={tool}
          onToolChange={handleToolChange}
          color={color}
          onColorChange={setColor}
          size={size}
          onSizeChange={setSize}
          panMode={panMode}
          onPanModeToggle={() => setPanMode((p) => !p)}
          canUndo={past.length > 0}
          canRedo={future.length > 0}
          onUndo={undo}
          onRedo={redo}
          onClear={clearBoard}
          onZoomIn={() => canvasRef.current?.zoomBy(1.2)}
          onZoomOut={() => canvasRef.current?.zoomBy(1 / 1.2)}
          onResetView={() => canvasRef.current?.resetView()}
        />
      </div>

      {showTitlePrompt ? (
        <TitlePromptModal
          initialValue={title}
          onSubmit={(t) => {
            setTitle(t)
            setShowTitlePrompt(false)
            persist(t) // first save: write to storage immediately, then autosave takes over
          }}
          onCancel={() => setShowTitlePrompt(false)}
        />
      ) : null}
    </div>
  )
}
