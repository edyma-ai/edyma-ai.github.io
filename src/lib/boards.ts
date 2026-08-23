// Local, client-only persistence for the smart classroom boards feature.
// Boards live entirely in localStorage — no backend, no auth. Each board stores
// vector strokes (re-editable on reopen); list previews are rendered live from them.

const BOARDS_KEY = 'edyma-boards'

export type ToolKind = 'pen' | 'pencil' | 'highlighter' | 'eraser'

// A single freehand stroke. Points are in world coordinates (independent of the
// current pan/zoom) as [x, y, pressure] tuples consumed by perfect-freehand.
export interface Stroke {
  tool: ToolKind
  color: string
  size: number
  points: [number, number, number][]
}

/**
 * The chapter a board is tied to, so its content drawer reopens on the class,
 * subject and chapter the teacher last pulled content from. Boards saved before
 * the drawer existed simply have none.
 */
export interface BoardContext {
  classId: string
  subjectId: string
  chapterId: string
}

export interface Board {
  id: string
  title: string
  strokes: Stroke[]
  createdAt: number
  updatedAt: number
  context?: BoardContext
}

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
}

function makeId(): string {
  // crypto.randomUUID isn't available on the very old browsers this site targets
  // (@vitejs/plugin-legacy → Chrome 30+), so fall back to a timestamp + random id.
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `b_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`
}

/** Read all boards. Returns [] when absent, in SSR, or on corrupt JSON. */
export function loadBoards(): Board[] {
  if (!isBrowser()) return []
  try {
    const raw = window.localStorage.getItem(BOARDS_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter((b): b is Board => !!b && typeof b.id === 'string' && Array.isArray(b.strokes))
  } catch {
    return []
  }
}

export class BoardsQuotaError extends Error {
  constructor() {
    super('Storage full — delete a board to free space.')
    this.name = 'BoardsQuotaError'
  }
}

/** Persist the full board list. Throws BoardsQuotaError when localStorage is full. */
export function saveBoards(boards: Board[]): void {
  if (!isBrowser()) return
  try {
    window.localStorage.setItem(BOARDS_KEY, JSON.stringify(boards))
  } catch (err) {
    if (err instanceof DOMException && (err.name === 'QuotaExceededError' || err.code === 22)) {
      throw new BoardsQuotaError()
    }
    throw err
  }
}

export function getBoard(id: string): Board | undefined {
  return loadBoards().find((b) => b.id === id)
}

/** Insert or replace a board, returning the new full list. */
export function upsertBoard(board: Board): Board[] {
  const boards = loadBoards()
  const idx = boards.findIndex((b) => b.id === board.id)
  if (idx === -1) boards.push(board)
  else boards[idx] = board
  saveBoards(boards)
  return boards
}

export function deleteBoard(id: string): Board[] {
  const boards = loadBoards().filter((b) => b.id !== id)
  saveBoards(boards)
  return boards
}

/** Create (and persist) a fresh, untitled, empty board. */
export function createBoard(): Board {
  const now = Date.now()
  const board: Board = { id: makeId(), title: '', strokes: [], createdAt: now, updatedAt: now }
  upsertBoard(board)
  return board
}
