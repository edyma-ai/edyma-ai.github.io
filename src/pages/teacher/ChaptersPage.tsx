import { useCallback } from 'react'
import { Link, useParams } from 'react-router-dom'
import { BookOpen, ChevronLeft } from 'react-feather'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { Spinner } from '@/components/ui/Spinner'
import { useApiData } from '@/hooks/useApiData'
import { fetchChapters, fetchTeacherClassroom } from '@/lib/classroom'

export function ChaptersPage() {
  const { classId = '', subjectId = '' } = useParams()

  const load = useCallback(async () => {
    const [classes, chapters] = await Promise.all([fetchTeacherClassroom(), fetchChapters(subjectId)])
    const currentClass = classes.find((item) => item.class_id === classId)
    return {
      className: currentClass?.class_name ?? '',
      subjectName: currentClass?.subjects.find((subject) => subject.id === subjectId)?.name ?? '',
      chapters,
    }
  }, [classId, subjectId])

  const subject = useApiData(load)

  if (subject.loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner size="lg" className="text-primary" />
      </div>
    )
  }

  if (subject.error || !subject.data) {
    return <ErrorState title="Couldn't load chapters" message={subject.error ?? undefined} onRetry={subject.reload} />
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-5 py-8 sm:px-6">
      <Link to="/teacher" className="inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-fg">
        <ChevronLeft size={16} />
        Your classes
      </Link>

      <h1 className="mt-4 text-2xl font-bold text-fg">{subject.data.subjectName || 'Chapters'}</h1>
      {subject.data.className ? <p className="mt-1 text-sm text-muted">{subject.data.className}</p> : null}

      {subject.data.chapters.length === 0 ? (
        <EmptyState icon={BookOpen} title="No chapters yet" description="This subject has no published chapters." />
      ) : (
        <ul className="mt-8 flex flex-col gap-3">
          {subject.data.chapters.map((chapter, index) => (
            <li key={chapter.id}>
              <Link
                to={`/teacher/${classId}/${subjectId}/${chapter.id}`}
                className="flex items-start gap-4 rounded-2xl border border-border bg-surface p-5 transition-colors hover:border-primary/40 hover:bg-surface-hover"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary-muted text-sm font-semibold text-primary">
                  {chapter.order || index + 1}
                </span>
                <span className="min-w-0">
                  <span className="block font-medium text-fg">{chapter.name}</span>
                  {chapter.description ? <span className="mt-1 block text-sm text-muted">{chapter.description}</span> : null}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
