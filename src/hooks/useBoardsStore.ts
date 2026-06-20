// Thin React layer over the localStorage board CRUD in lib/boards.ts.
// Keeps an in-memory list in sync with storage and refreshes when another tab
// edits the same key (via the window 'storage' event).
import { useCallback, useEffect, useState } from 'react'
import { type Board, createBoard, deleteBoard, loadBoards } from '@/lib/boards'

export function useBoardsStore() {
  const [boards, setBoards] = useState<Board[]>(() => loadBoards())

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      // Only react to our key (or a full clear, where e.key is null).
      if (e.key === 'edyma-boards' || e.key === null) {
        setBoards(loadBoards())
      }
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const refresh = useCallback(() => setBoards(loadBoards()), [])

  const create = useCallback((): Board => {
    const board = createBoard()
    setBoards(loadBoards())
    return board
  }, [])

  const remove = useCallback((id: string) => {
    setBoards(deleteBoard(id))
  }, [])

  return { boards, refresh, create, remove }
}
