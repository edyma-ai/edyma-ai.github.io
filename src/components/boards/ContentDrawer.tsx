// The board's side drawer for pulling chapter content onto the canvas: pick a
// class, subject and chapter, then a video, sim or study guide. Only a signed-in
// teacher has a classroom, so a visitor gets a sign-in prompt instead.
import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { BookOpen, ChevronRight, FileText, Film, LogIn, X, Zap } from 'react-feather'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '@/auth/useAuth'
import type { BoardContentItem } from '@/components/boards/ContentPanel'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { Spinner } from '@/components/ui/Spinner'
import { useApiData } from '@/hooks/useApiData'
import type { BoardContext } from '@/lib/boards'
import {
  fetchChapter,
  fetchChapters,
  fetchStudyGuides,
  fetchTeacherClassroom,
  formatDuration,
  type Chapter,
  type ChapterListItem,
  type StudyGuide,
} from '@/lib/classroom'
import { cn } from '@/lib/cn'

interface ContentDrawerProps {
  /** The chapter this board last used, restored as the picker's starting point. */
  context: BoardContext | null
  onContextChange: (context: BoardContext) => void
  onSelectItem: (item: BoardContentItem) => void
  onClose: () => void
}

type ContentTab = 'videos' | 'interactive' | 'guides'

const TABS: { id: ContentTab; label: string }[] = [
  { id: 'videos', label: 'Videos' },
  { id: 'interactive', label: 'Interactive' },
  { id: 'guides', label: 'Study guides' },
]

export function ContentDrawer({ context, onContextChange, onSelectItem, onClose }: ContentDrawerProps) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (!user) {
    if (loading) {
      return (
        <DrawerShell onClose={onClose}>
          <div className="flex flex-1 items-center justify-center">
            <Spinner className="text-muted" />
          </div>
        </DrawerShell>
      )
    }
    return (
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Teacher sign-in required"
        className="pointer-events-auto absolute inset-0 z-40 flex items-center justify-center bg-black/50 px-6"
        onMouseDown={(event) => {
          if (event.target === event.currentTarget) onClose()
        }}
      >
        <div className="w-full max-w-sm rounded-2xl border border-border bg-surface p-6 shadow-2xl">
          <h2 className="text-lg font-semibold text-fg">Chapter content</h2>
          <p className="mt-2 text-sm text-muted">
            Sign in as a teacher to pull up your chapters' videos, sims and study guides.
          </p>
          <div className="mt-5 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-sm font-medium text-muted transition-colors hover:bg-surface-hover hover:text-fg"
            >
              Not now
            </button>
            <Link
              to="/teacher/login"
              state={{ from: `${location.pathname}${location.search}` }}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-fg transition-colors hover:bg-primary-hover"
            >
              <LogIn size={15} />
              Teacher sign-in
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <DrawerShell onClose={onClose}>
      <ChapterBrowser context={context} onContextChange={onContextChange} onSelectItem={onSelectItem} />
    </DrawerShell>
  )
}

/** Right-hand drawer on a desktop, bottom sheet on a phone. */
function DrawerShell({ onClose, children }: { onClose: () => void; children: ReactNode }) {
  return (
    <aside
      aria-label="Chapter content"
      className="pointer-events-auto absolute inset-x-0 bottom-0 z-40 flex h-[70%] flex-col rounded-t-2xl border-t border-border bg-bg shadow-2xl sm:top-16 sm:left-auto sm:h-auto sm:w-[380px] sm:rounded-none sm:border-t-0 sm:border-l"
    >
      <header className="flex items-center gap-2 border-b border-border px-4 py-3">
        <BookOpen size={16} className="shrink-0 text-primary" />
        <h2 className="min-w-0 flex-1 truncate text-sm font-semibold text-fg">Chapter content</h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close chapter content"
          title="Close chapter content"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-muted transition-colors hover:bg-primary-muted hover:text-primary"
        >
          <X size={16} />
        </button>
      </header>
      {children}
    </aside>
  )
}

function ChapterBrowser({
  context,
  onContextChange,
  onSelectItem,
}: {
  context: BoardContext | null
  onContextChange: (context: BoardContext) => void
  onSelectItem: (item: BoardContentItem) => void
}) {
  const [selection, setSelection] = useState<BoardContext | null>(context)
  const [tab, setTab] = useState<ContentTab>('videos')

  const loadClassroom = useCallback(() => fetchTeacherClassroom(), [])
  const classroom = useApiData(loadClassroom)

  // Each level falls back to the first entry, so the picker is never in a state
  // with nothing chosen while the level below it has options.
  const classes = classroom.data ?? []
  const activeClass = classes.find((item) => item.class_id === (selection ? selection.classId : '')) ?? classes[0]
  const subjects = activeClass ? activeClass.subjects : []
  const activeSubject = subjects.find((item) => item.id === (selection ? selection.subjectId : '')) ?? subjects[0]
  const subjectId = activeSubject ? activeSubject.id : ''

  const loadChapters = useCallback(
    () => (subjectId ? fetchChapters(subjectId) : Promise.resolve<ChapterListItem[]>([])),
    [subjectId],
  )
  const chapters = useApiData(loadChapters)
  const chapterList = chapters.data ?? []
  const activeChapter = chapterList.find((item) => item.id === (selection ? selection.chapterId : '')) ?? chapterList[0]
  const chapterId = activeChapter ? activeChapter.id : ''

  const loadContent = useCallback(async (): Promise<{ chapter: Chapter | null; guides: StudyGuide[] }> => {
    if (!chapterId) return { chapter: null, guides: [] }
    const [chapter, guides] = await Promise.all([
      fetchChapter(chapterId),
      // A plan without the TLM feature simply has no guides; that must not take
      // the sims and videos down with it.
      fetchStudyGuides(chapterId).catch((): StudyGuide[] => []),
    ])
    return { chapter, guides }
  }, [chapterId])
  const content = useApiData(loadContent)

  // Hand the resolved chapter back to the board so it reopens here next time.
  const classId = activeClass ? activeClass.class_id : ''
  useEffect(() => {
    if (!classId || !subjectId || !chapterId) return
    onContextChange({ classId, subjectId, chapterId })
  }, [classId, subjectId, chapterId, onContextChange])

  if (classroom.loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Spinner className="text-muted" />
      </div>
    )
  }

  if (classroom.error) {
    return <ErrorState title="Couldn't load your classes" message={classroom.error} onRetry={classroom.reload} className="flex-1" />
  }

  if (!activeClass) {
    return (
      <EmptyState
        icon={BookOpen}
        title="No classes assigned yet"
        description="The classes you teach appear here as soon as your school assigns you to a section."
        className="flex-1"
      />
    )
  }

  const chapter = content.data ? content.data.chapter : null
  const videos = chapter && chapter.videos ? chapter.videos : []
  const elements = chapter && chapter.interactive_elements ? chapter.interactive_elements : []
  const guides = content.data ? content.data.guides : []
  const itemContext: BoardContext = { classId, subjectId, chapterId }

  const rows =
    tab === 'videos'
      ? videos.map((video) => (
          <ContentRow
            key={video.id}
            icon={<Film size={15} />}
            title={video.title}
            meta={formatDuration(video.duration_sec)}
            onClick={() => onSelectItem({ kind: 'video', id: video.id, title: video.title, context: itemContext, video })}
          />
        ))
      : tab === 'interactive'
        ? elements.map((element) => (
            <ContentRow
              key={element.id}
              icon={<Zap size={15} />}
              title={element.title}
              onClick={() => onSelectItem({ kind: 'interactive', id: element.id, title: element.title, context: itemContext })}
            />
          ))
        : guides.map((guide) => (
            <ContentRow
              key={guide.tlm_id}
              icon={<FileText size={15} />}
              title={guide.title}
              meta={new Date(guide.shared_at).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
              onClick={() =>
                onSelectItem({ kind: 'guide', id: guide.tlm_id, title: guide.title, context: itemContext, sections: guide.sections })
              }
            />
          ))

  return (
    <>
      <div className="grid gap-3 border-b border-border px-4 py-4">
        <PickerSelect
          label="Class"
          value={activeClass.class_id}
          options={classes.map((item) => ({ value: item.class_id, label: item.class_name }))}
          onChange={(value) => setSelection({ classId: value, subjectId: '', chapterId: '' })}
        />
        <PickerSelect
          label="Subject"
          value={subjectId}
          options={subjects.map((item) => ({ value: item.id, label: item.name }))}
          onChange={(value) => setSelection({ classId: activeClass.class_id, subjectId: value, chapterId: '' })}
        />
        <PickerSelect
          label="Chapter"
          value={chapterId}
          loading={chapters.loading}
          options={chapterList.map((item) => ({ value: item.id, label: item.name }))}
          onChange={(value) => setSelection({ classId: activeClass.class_id, subjectId, chapterId: value })}
        />
      </div>

      <div className="flex gap-1 border-b border-border px-3 py-2">
        {TABS.map((entry) => (
          <button
            key={entry.id}
            type="button"
            onClick={() => setTab(entry.id)}
            aria-pressed={tab === entry.id}
            className={cn(
              'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
              tab === entry.id ? 'bg-primary text-primary-fg' : 'text-muted hover:bg-surface-hover hover:text-fg',
            )}
          >
            {entry.label}
          </button>
        ))}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3">
        {chapters.error ? (
          <ErrorState title="Couldn't load chapters" message={chapters.error} onRetry={chapters.reload} />
        ) : content.loading ? (
          <div className="flex items-center justify-center py-14">
            <Spinner className="text-muted" />
          </div>
        ) : content.error ? (
          <ErrorState title="Couldn't load this chapter" message={content.error} onRetry={content.reload} />
        ) : !chapter ? (
          <EmptyState icon={BookOpen} title="No chapters yet" description="This subject has no chapters to pull content from." />
        ) : rows.length > 0 ? (
          <ul className="flex flex-col gap-2">{rows}</ul>
        ) : tab === 'videos' ? (
          <EmptyState icon={Film} title="No videos for this chapter yet" />
        ) : tab === 'interactive' ? (
          <EmptyState icon={Zap} title="No interactive elements for this chapter yet" />
        ) : (
          <EmptyState
            icon={FileText}
            title="No study guides for this chapter yet"
            description="Guides you share with a section from the Edyma app show up here."
          />
        )}
      </div>
    </>
  )
}

function PickerSelect({
  label,
  value,
  options,
  loading,
  onChange,
}: {
  label: string
  value: string
  options: { value: string; label: string }[]
  loading?: boolean
  onChange: (value: string) => void
}) {
  return (
    <label className="block text-xs font-medium text-muted">
      {label}
      <select
        value={value}
        disabled={loading || options.length === 0}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-fg outline-none transition-colors focus:border-primary disabled:opacity-50"
      >
        {options.length === 0 ? <option value="">{loading ? 'Loading…' : 'Nothing here yet'}</option> : null}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  )
}

function ContentRow({ icon, title, meta, onClick }: { icon: ReactNode; title: string; meta?: string | null; onClick: () => void }) {
  return (
    <li>
      <button
        type="button"
        onClick={onClick}
        className="flex w-full items-center gap-3 rounded-xl border border-border bg-surface px-3 py-3 text-left transition-colors hover:border-primary/40 hover:bg-surface-hover"
      >
        <span className="shrink-0 text-primary">{icon}</span>
        <span className="min-w-0 flex-1 truncate text-sm font-medium text-fg">{title}</span>
        {meta ? <span className="shrink-0 text-xs text-muted">{meta}</span> : null}
        <ChevronRight size={15} className="shrink-0 text-muted" />
      </button>
    </li>
  )
}
