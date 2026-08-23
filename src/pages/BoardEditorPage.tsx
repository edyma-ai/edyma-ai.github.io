import { type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ChevronLeft, Clipboard, Copy, Download, Maximize, Minimize, Moon, MousePointer, Save, Scissors, Sun, Trash2 } from 'react-feather'
import { Navigate, useNavigate, useParams } from 'react-router-dom'

import { BoardCanvas, type BoardCanvasHandle, type BoardContextInfo, type SelectionRect } from '@/components/boards/BoardCanvas'
import { BoardToolbar } from '@/components/boards/BoardToolbar'
import { ConfirmModal, type ConfirmOptions } from '@/components/ui/ConfirmModal'
import { ContextMenu, type MenuItem } from '@/components/boards/ContextMenu'
import { SelectionToolbar } from '@/components/boards/SelectionToolbar'
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

const PASTE_OFFSET = 24 // world px nudge so pasted/duplicated strokes are visible

function cloneStrokes(list: Stroke[]): Stroke[] {
  return list.map((st) => ({ ...st, points: st.points.map((pt) => [...pt] as [number, number, number]) }))
}

function offsetStrokes(list: Stroke[], d: number): Stroke[] {
  return list.map((st) => ({ ...st, points: st.points.map(([x, y, p]) => [x + d, y + d, p] as [number, number, number]) }))
}

function translateStrokes(list: Stroke[], dx: number, dy: number): Stroke[] {
  return list.map((st) => ({ ...st, points: st.points.map(([x, y, p]) => [x + dx, y + dy, p] as [number, number, number]) }))
}

const MOD_LABEL = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent) ? '⌘' : 'Ctrl '

// Ghost icon button used in the top-bar action pill.
function IconButton({
  onClick,
  label,
  variant = 'default',
  children,
}: {
  onClick: () => void
  label: string
  variant?: 'default' | 'danger'
  children: ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={cn(
        'flex h-9 w-9 items-center justify-center rounded-full transition-all duration-150 hover:scale-105 active:scale-90',
        variant === 'danger'
          ? 'text-muted hover:bg-red-500/10 hover:text-red-500'
          : 'text-muted hover:bg-primary-muted hover:text-primary',
      )}
    >
      {children}
    </button>
  )
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
  const rootRef = useRef<HTMLDivElement>(null)

  const [strokes, setStrokes] = useState<Stroke[]>(board.strokes)
  const [past, setPast] = useState<Stroke[][]>([])
  const [future, setFuture] = useState<Stroke[][]>([])

  const [tool, setTool] = useState<ToolKind>('pen')
  const [color, setColor] = useState('#0f172a')
  const [size, setSize] = useState(TOOL_PRESETS.pen.defaultSize)
  const [panMode, setPanMode] = useState(false)
  const [selectMode, setSelectMode] = useState(false)
  const [selectedIndices, setSelectedIndices] = useState<number[]>([])
  const [selectionRect, setSelectionRect] = useState<SelectionRect | null>(null)
  const [clipboard, setClipboard] = useState<Stroke[] | null>(null)

  const [title, setTitle] = useState(board.title)
  const [saveState, setSaveState] = useState<SaveState>(board.title.trim() ? 'saved' : 'unsaved')
  const [theme, setTheme] = useState<Theme>(() => readTheme())
  const [showTitlePrompt, setShowTitlePrompt] = useState(false)
  const [confirm, setConfirm] = useState<ConfirmOptions | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; world: { x: number; y: number }; onStroke: boolean } | null>(null)
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
      setSelectedIndices([])
    },
    [pushHistory],
  )

  // Translate the selected strokes by (dx, dy) in world units. Order is preserved
  // so the selection indices stay valid afterwards.
  const moveStrokes = useCallback(
    (indices: number[], dx: number, dy: number) => {
      const set = new Set(indices)
      pushHistory()
      setStrokes((s) =>
        s.map((st, i) =>
          set.has(i)
            ? { ...st, points: st.points.map(([x, y, p]) => [x + dx, y + dy, p] as [number, number, number]) }
            : st,
        ),
      )
    },
    [pushHistory],
  )

  // --- selection clipboard actions -----------------------------------------
  const copySelection = useCallback(() => {
    if (selectedIndices.length === 0) return
    setClipboard(cloneStrokes(selectedIndices.map((i) => strokes[i]).filter(Boolean)))
  }, [selectedIndices, strokes])

  const cutSelection = useCallback(() => {
    if (selectedIndices.length === 0) return
    setClipboard(cloneStrokes(selectedIndices.map((i) => strokes[i]).filter(Boolean)))
    eraseStrokes(selectedIndices) // also clears the selection
  }, [selectedIndices, strokes, eraseStrokes])

  // Paste the clipboard centred at `target` world coords.
  const pasteAtPoint = useCallback(
    (target: { x: number; y: number }) => {
      if (!clipboard || clipboard.length === 0) return
      const b = strokesBounds(clipboard, 0)
      if (!b) return
      const cx = (b.minX + b.maxX) / 2
      const cy = (b.minY + b.maxY) / 2
      const pasted = translateStrokes(clipboard, target.x - cx, target.y - cy)
      const start = strokes.length
      pushHistory()
      setStrokes([...strokes, ...pasted])
      setPanMode(false)
      setSelectMode(true)
      setSelectedIndices(pasted.map((_, k) => start + k)) // select the pasted copies
    },
    [clipboard, strokes, pushHistory],
  )

  // Keyboard/toolbar paste lands at the centre of the visible viewport (so it
  // appears where you're looking, even after panning).
  const pasteClipboard = useCallback(() => {
    if (!clipboard || clipboard.length === 0) return
    const center = canvasRef.current?.getViewportCenterWorld()
    if (center) {
      pasteAtPoint(center)
    } else {
      const b = strokesBounds(clipboard, 0)
      if (b) pasteAtPoint({ x: (b.minX + b.maxX) / 2 + PASTE_OFFSET, y: (b.minY + b.maxY) / 2 + PASTE_OFFSET })
    }
  }, [clipboard, pasteAtPoint])

  const selectAll = useCallback(() => {
    if (strokes.length === 0) return
    setPanMode(false)
    setSelectMode(true)
    setSelectedIndices(strokes.map((_, i) => i))
  }, [strokes])

  const handleContextMenu = useCallback((info: BoardContextInfo) => {
    // Right-clicking a stroke selects it (preserving an existing multi-selection).
    if (info.onStroke) {
      setPanMode(false)
      setSelectMode(true)
      setSelectedIndices((cur) => (cur.includes(info.hitIndex) ? cur : [info.hitIndex]))
    }
    setContextMenu({ x: info.x, y: info.y, world: { x: info.worldX, y: info.worldY }, onStroke: info.onStroke })
  }, [])

  const duplicateSelection = useCallback(() => {
    if (selectedIndices.length === 0) return
    const dup = offsetStrokes(cloneStrokes(selectedIndices.map((i) => strokes[i]).filter(Boolean)), PASTE_OFFSET)
    const start = strokes.length
    pushHistory()
    setStrokes([...strokes, ...dup])
    setSelectedIndices(dup.map((_, k) => start + k))
  }, [selectedIndices, strokes, pushHistory])

  const deleteSelection = useCallback(() => {
    if (selectedIndices.length === 0) return
    eraseStrokes(selectedIndices)
  }, [selectedIndices, eraseStrokes])

  const clearBoard = useCallback(() => {
    if (strokes.length === 0) return
    setConfirm({
      title: 'Clear board?',
      message: 'This removes everything on the board. You can undo it afterwards.',
      confirmLabel: 'Clear board',
      onConfirm: () => {
        pushHistory()
        setStrokes([])
        setSelectedIndices([])
      },
    })
  }, [strokes.length, pushHistory])

  const undo = useCallback(() => {
    setSelectedIndices([])
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
    setSelectedIndices([])
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
    setConfirm({
      title: 'Delete board?',
      message: `"${label}" will be permanently removed. This cannot be undone.`,
      confirmLabel: 'Delete board',
      onConfirm: () => {
        deleteBoard(board.id)
        onBack()
      },
    })
  }, [title, board.id, onBack])

  // Select-tool mode toggles (mutually exclusive with pan / drawing).
  const toggleSelect = useCallback(() => {
    setPanMode(false)
    setSelectMode((s) => {
      if (s) setSelectedIndices([])
      return !s
    })
  }, [])

  const togglePan = useCallback(() => {
    setSelectMode(false)
    setSelectedIndices([])
    setPanMode((pPan) => !pPan)
  }, [])

  // Keyboard shortcuts: undo/redo, save, and delete-selection.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // Don't hijack typing in the title field.
      const target = e.target as HTMLElement | null
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) return

      const key = e.key.toLowerCase()
      if (selectMode && selectedIndices.length > 0 && (key === 'delete' || key === 'backspace')) {
        e.preventDefault()
        eraseStrokes(selectedIndices)
        return
      }

      const mod = e.metaKey || e.ctrlKey
      if (!mod) return

      if (key === 'a' && strokes.length > 0) {
        e.preventDefault()
        selectAll()
        return
      }

      // Clipboard actions (select mode).
      if (selectMode) {
        if (key === 'c' && selectedIndices.length > 0) {
          e.preventDefault()
          copySelection()
          return
        }
        if (key === 'x' && selectedIndices.length > 0) {
          e.preventDefault()
          cutSelection()
          return
        }
        if (key === 'v') {
          e.preventDefault()
          pasteClipboard()
          return
        }
        if (key === 'd' && selectedIndices.length > 0) {
          e.preventDefault()
          duplicateSelection()
          return
        }
      }

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
  }, [undo, redo, saveNow, selectMode, selectedIndices, strokes.length, selectAll, eraseStrokes, copySelection, cutSelection, pasteClipboard, duplicateSelection])

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

  // Keep fullscreen state in sync (covers Esc / browser-driven exits too).
  useEffect(() => {
    const onChange = () => setIsFullscreen(Boolean(document.fullscreenElement))
    document.addEventListener('fullscreenchange', onChange)
    return () => document.removeEventListener('fullscreenchange', onChange)
  }, [])

  const toggleFullscreen = useCallback(() => {
    const el = rootRef.current
    if (!el) return
    if (document.fullscreenElement) {
      void document.exitFullscreen?.()
    } else {
      void el.requestFullscreen?.().catch(() => {})
    }
  }, [])

  const handleToolChange = useCallback((t: ToolKind) => {
    setPanMode(false)
    setSelectMode(false)
    setSelectedIndices([])
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
    <div ref={rootRef} className={cn('relative h-screen w-screen overflow-hidden bg-bg', theme === 'light' && 'present-theme-light')}>
      <BoardCanvas
        ref={canvasRef}
        strokes={strokes}
        tool={tool}
        color={color}
        size={size}
        panMode={panMode}
        selectMode={selectMode}
        selectedIndices={selectedIndices}
        onCommitStroke={commitStroke}
        onEraseStrokes={eraseStrokes}
        onSelectionChange={setSelectedIndices}
        onMoveStrokes={moveStrokes}
        onSelectionRect={setSelectionRect}
        onContextMenu={handleContextMenu}
      />

      {selectMode && selectedIndices.length > 0 && selectionRect ? (
        <SelectionToolbar
          rect={selectionRect}
          canPaste={!!clipboard && clipboard.length > 0}
          onCopy={copySelection}
          onCut={cutSelection}
          onPaste={pasteClipboard}
          onDuplicate={duplicateSelection}
          onDelete={deleteSelection}
        />
      ) : null}

      {/* Top bar */}
      <div className="pointer-events-none absolute inset-x-0 top-0 flex items-center gap-3 p-3">
        <button
          type="button"
          onClick={onBack}
          className="pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface text-muted shadow-lg transition-all duration-150 hover:scale-105 hover:border-primary/40 hover:text-primary active:scale-90"
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
              className="pointer-events-auto flex h-10 items-center gap-2 rounded-full bg-primary px-4 text-sm font-semibold text-primary-fg shadow-lg transition-all duration-150 hover:bg-primary-hover hover:shadow-xl active:scale-95"
              aria-label="Save board"
              title="Save board (Ctrl/Cmd+S)"
            >
              <Save size={18} />
              Save
            </button>
          ) : null}
          <div className="pointer-events-auto flex items-center gap-0.5 rounded-full border border-border bg-surface p-1 shadow-lg">
            <IconButton onClick={toggleFullscreen} label={isFullscreen ? 'Exit full screen' : 'Full screen'}>
              {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
            </IconButton>
            <IconButton onClick={exportPng} label="Export as PNG">
              <Download size={18} />
            </IconButton>
            <IconButton
              onClick={toggleTheme}
              label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </IconButton>
            <span className="mx-0.5 h-5 w-px bg-border" />
            <IconButton onClick={deleteBoardNow} label="Delete board" variant="danger">
              <Trash2 size={18} />
            </IconButton>
          </div>
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
          onPanModeToggle={togglePan}
          selectMode={selectMode}
          onSelectModeToggle={toggleSelect}
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

      {confirm ? <ConfirmModal {...confirm} onClose={() => setConfirm(null)} /> : null}

      {contextMenu
        ? (() => {
            const items: MenuItem[] = []
            if (contextMenu.onStroke) {
              items.push({ label: 'Duplicate', icon: <Copy size={15} />, shortcut: `${MOD_LABEL}D`, onSelect: duplicateSelection })
              items.push({ label: 'Copy', icon: <Copy size={15} />, shortcut: `${MOD_LABEL}C`, onSelect: copySelection })
              items.push({ label: 'Cut', icon: <Scissors size={15} />, shortcut: `${MOD_LABEL}X`, onSelect: cutSelection })
              if (clipboard?.length) items.push({ label: 'Paste here', icon: <Clipboard size={15} />, shortcut: `${MOD_LABEL}V`, onSelect: () => pasteAtPoint(contextMenu.world) })
              items.push({ label: 'Delete', icon: <Trash2 size={15} />, shortcut: '⌫', danger: true, onSelect: deleteSelection })
            } else {
              if (clipboard?.length) items.push({ label: 'Paste here', icon: <Clipboard size={15} />, shortcut: `${MOD_LABEL}V`, onSelect: () => pasteAtPoint(contextMenu.world) })
              if (strokes.length) items.push({ label: 'Select all', icon: <MousePointer size={15} />, shortcut: `${MOD_LABEL}A`, onSelect: selectAll })
            }
            if (items.length === 0) return null
            return <ContextMenu x={contextMenu.x} y={contextMenu.y} items={items} onClose={() => setContextMenu(null)} />
          })()
        : null}
    </div>
  )
}
