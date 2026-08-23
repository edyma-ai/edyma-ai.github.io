import { useCallback, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { ChevronLeft, Edit3, FileText, Film, Zap } from 'react-feather'
import { ChapterVideoCard } from '@/components/classroom/ChapterVideoCard'
import { InteractiveEmbed } from '@/components/classroom/InteractiveEmbed'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { Spinner } from '@/components/ui/Spinner'
import { useApiData } from '@/hooks/useApiData'
import { BoardsQuotaError, createBoard, upsertBoard } from '@/lib/boards'
import { fetchChapter, fetchStudyGuides, type StudyGuide } from '@/lib/classroom'
import { cn } from '@/lib/cn'

type BoardTab = 'guides' | 'interactive' | 'videos'

function isBoardTab(value: string | null): value is BoardTab {
  return value === 'guides' || value === 'interactive' || value === 'videos'
}

function formatSharedDate(sharedAt: number): string {
  return new Date(sharedAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })
}

export function ChapterBoardPage() {
  const { classId = '', subjectId = '', chapterId = '' } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [selectedTab, setSelectedTab] = useState<BoardTab | null>(null)
  const [boardError, setBoardError] = useState<string | null>(null)

  const load = useCallback(async () => {
    const [chapter, guides] = await Promise.all([
      fetchChapter(chapterId),
      // A plan without the TLM feature simply has no guides; that must not
      // take the sims and videos down with it.
      fetchStudyGuides(chapterId).catch((): StudyGuide[] => []),
    ])
    return { chapter, guides }
  }, [chapterId])

  const board = useApiData(load)

  if (board.loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner size="lg" className="text-primary" />
      </div>
    )
  }

  if (board.error || !board.data) {
    return <ErrorState title="Couldn't load this chapter" message={board.error ?? undefined} onRetry={board.reload} />
  }

  const { chapter, guides } = board.data
  const elements = chapter.interactive_elements ?? []
  const videos = chapter.videos ?? []

  // Open on the tab the board panel asked for, else the one that actually has
  // something in it, unless the teacher has picked one since.
  const requestedTab = searchParams.get('tab')
  const firstFilledTab: BoardTab = guides.length > 0 ? 'guides' : elements.length > 0 ? 'interactive' : 'videos'
  const tab = selectedTab ?? (isBoardTab(requestedTab) ? requestedTab : firstFilledTab)

  // A whiteboard for this chapter: a new local board, named after it, opened
  // with the content drawer already on this chapter.
  const openWhiteboard = () => {
    try {
      const board = createBoard()
      upsertBoard({ ...board, title: chapter.name, updatedAt: Date.now() })
      navigate(
        `/boards/${board.id}?chapter=${encodeURIComponent(chapterId)}&classId=${encodeURIComponent(classId)}&subjectId=${encodeURIComponent(subjectId)}`,
      )
    } catch (err) {
      setBoardError(err instanceof BoardsQuotaError ? err.message : 'Could not open a whiteboard.')
    }
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-5 py-8 sm:px-6">
      <Link
        to={`/teacher/${classId}/${subjectId}`}
        className="inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-fg"
      >
        <ChevronLeft size={16} />
        Chapters
      </Link>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-fg">{chapter.name}</h1>
          {chapter.description ? <p className="mt-1 text-sm text-muted">{chapter.description}</p> : null}
        </div>
        <button
          type="button"
          onClick={openWhiteboard}
          className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-fg transition-colors hover:border-primary/50 hover:bg-primary-muted hover:text-primary"
        >
          <Edit3 size={15} />
          Open on a whiteboard
        </button>
      </div>
      {boardError ? <p className="mt-2 text-sm text-red-400">{boardError}</p> : null}

      <div className="mt-6 flex flex-wrap gap-1 rounded-lg border border-border p-1">
        <TabButton active={tab === 'guides'} onClick={() => setSelectedTab('guides')} label="Study guides" count={guides.length} />
        <TabButton active={tab === 'interactive'} onClick={() => setSelectedTab('interactive')} label="Interactive" count={elements.length} />
        <TabButton active={tab === 'videos'} onClick={() => setSelectedTab('videos')} label="Videos" count={videos.length} />
      </div>

      <div className="mt-6">
        {tab === 'guides' ? (
          guides.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="No study guides shared yet"
              description="Study guides you share with a section from the Edyma app show up here, ready to present and annotate."
            />
          ) : (
            <ul className="flex flex-col gap-3">
              {guides.map((guide) => (
                <li key={guide.tlm_id}>
                  <Link
                    to={`/teacher/${classId}/${subjectId}/${chapterId}/tlm/${guide.tlm_id}`}
                    className="flex items-center gap-4 rounded-2xl border border-border bg-surface p-5 transition-colors hover:border-primary/40 hover:bg-surface-hover"
                  >
                    <FileText size={18} className="shrink-0 text-primary" />
                    <span className="min-w-0 flex-1">
                      <span className="block font-medium text-fg">{guide.title}</span>
                      <span className="mt-1 block text-sm text-muted">Shared {formatSharedDate(guide.shared_at)}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )
        ) : null}

        {tab === 'interactive' ? (
          elements.length === 0 ? (
            <EmptyState icon={Zap} title="No interactive elements" description="This chapter has no sims to project yet." />
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {elements.map((element) => (
                <InteractiveEmbed key={element.id} elementId={element.id} allowFullscreen />
              ))}
            </div>
          )
        ) : null}

        {tab === 'videos' ? (
          videos.length === 0 ? (
            <EmptyState icon={Film} title="No videos" description="This chapter has no videos yet." />
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {videos.map((video) => (
                <ChapterVideoCard key={video.id} video={video} />
              ))}
            </div>
          )
        ) : null}
      </div>
    </div>
  )
}

function TabButton({ active, onClick, label, count }: { active: boolean; onClick: () => void; label: string; count: number }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'rounded-md px-4 py-2 text-sm font-medium transition-colors',
        active ? 'bg-primary text-primary-fg' : 'text-muted hover:bg-surface-hover hover:text-fg',
      )}
    >
      {label}
      {count > 0 ? <span className="ml-1.5 opacity-70">{count}</span> : null}
    </button>
  )
}
