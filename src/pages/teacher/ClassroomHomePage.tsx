import { useCallback } from 'react'
import { Link } from 'react-router-dom'
import { BookOpen } from 'react-feather'
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
      <EmptyState
        icon={BookOpen}
        title="No classes assigned yet"
        description="The classes you teach appear here as soon as your school assigns you to a section."
      />
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
    </div>
  )
}
