import { useNavigate } from 'react-router-dom'
import { Plus } from 'react-feather'

import { BoardCard } from '@/components/boards/BoardCard'
import { Container } from '@/components/ui/Container'
import { useBoardsStore } from '@/hooks/useBoardsStore'

export function BoardsListPage() {
  const { boards, create, remove } = useBoardsStore()
  const navigate = useNavigate()

  const sorted = [...boards].sort((a, b) => b.updatedAt - a.updatedAt)

  const handleNew = () => {
    const board = create()
    navigate(`/boards/${board.id}`)
  }

  return (
    <Container size="xl" className="py-10 sm:py-14">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-fg sm:text-4xl">Boards</h1>
          <p className="mt-2 text-muted">Scribble, sketch, and teach. Boards are saved on this device.</p>
        </div>
        <button
          type="button"
          onClick={handleNew}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 font-semibold text-primary-fg transition-colors hover:bg-primary-hover"
        >
          <Plus size={20} />
          New Board
        </button>
      </div>

      {sorted.length === 0 ? (
        <button
          type="button"
          onClick={handleNew}
          className="mt-10 flex w-full flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border bg-surface/40 px-6 py-20 text-center transition-colors hover:border-primary/40 hover:bg-surface"
        >
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-muted text-primary">
            <Plus size={26} />
          </span>
          <span className="text-lg font-semibold text-fg">Create your first board</span>
          <span className="max-w-sm text-sm text-muted">
            Start a blank canvas and draw with pen, pencil, highlighter, and more.
          </span>
        </button>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {sorted.map((board) => (
            <BoardCard key={board.id} board={board} onDelete={remove} />
          ))}
        </div>
      )}
    </Container>
  )
}
