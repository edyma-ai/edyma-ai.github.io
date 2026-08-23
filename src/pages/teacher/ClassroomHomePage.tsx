import { useCallback } from 'react'
import { Link } from 'react-router-dom'
import { BookOpen, ChevronRight, Edit3 } from 'react-feather'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { Spinner } from '@/components/ui/Spinner'
import { useApiData } from '@/hooks/useApiData'
import { fetchTeacherClassroom } from '@/lib/classroom'

export function ClassroomHomePage() {
  const load = useCallback(() => fetchTeacherClassroom(), [])
  const classroom = useApiData(load)

  if (classroom.loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner size="lg" className="text-primary" />
      </div>
    )
  }

  if (classroom.error || !classroom.data) {
    return <ErrorState title="Couldn't load your classes" message={classroom.error ?? undefined} onRetry={classroom.reload} />
  }

  if (classroom.data.length === 0) {
    return (
      <div className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-6">
        <EmptyState
          icon={BookOpen}
          title="No classes assigned yet"
          description="The classes you teach appear here as soon as your school assigns you to a section."
        />
        <WhiteboardCallout />
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-6">
      <h1 className="text-2xl font-bold text-fg">Your classes</h1>
      <p className="mt-1 text-sm text-muted">Pick a subject to open its chapters, sims, videos and study guides.</p>

      <div className="mt-8 grid gap-5 sm:grid-cols-2">
        {classroom.data.map((classroomClass) => (
          <section key={classroomClass.class_id} className="rounded-2xl border border-border bg-surface p-6">
            <h2 className="text-lg font-semibold text-fg">{classroomClass.class_name}</h2>
            <p className="mt-1 text-sm text-muted">
              {classroomClass.sections.length > 0
                ? `Sections ${classroomClass.sections.map((section) => section.label).join(', ')}`
                : 'No sections assigned'}
            </p>

            {classroomClass.subjects.length > 0 ? (
              <div className="mt-5 flex flex-wrap gap-2">
                {classroomClass.subjects.map((subject) => (
                  <Link
                    key={subject.id}
                    to={`/teacher/${classroomClass.class_id}/${subject.id}`}
                    className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-fg transition-colors hover:border-primary/50 hover:bg-primary-muted hover:text-primary"
                  >
                    {subject.name}
                  </Link>
                ))}
              </div>
            ) : (
              <p className="mt-5 text-sm text-muted">No subjects in this class yet.</p>
            )}
          </section>
        ))}
      </div>

      <WhiteboardCallout />
    </div>
  )
}

/** Route into the free-form whiteboard, which pulls chapter content in on its own. */
function WhiteboardCallout() {
  return (
    <Link
      to="/boards"
      className="mt-8 flex items-center gap-4 rounded-2xl border border-border bg-surface p-5 transition-colors hover:border-primary/40 hover:bg-surface-hover"
    >
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-muted text-primary">
        <Edit3 size={18} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-semibold text-fg">Open a whiteboard</span>
        <span className="mt-1 block text-sm text-muted">
          Draw freely and pull up videos, sims and study guides from your chapters.
        </span>
      </span>
      <ChevronRight size={18} className="shrink-0 text-muted" />
    </Link>
  )
}
