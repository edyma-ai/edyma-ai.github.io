import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/auth/useAuth'
import { ErrorState } from '@/components/ui/ErrorState'
import { Spinner } from '@/components/ui/Spinner'

export function ProtectedRoute() {
  const { user, loading, error, restoreSession } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-bg">
        <Spinner size="lg" className="text-primary" />
        <p className="mt-4 text-sm text-muted">Loading your classroom…</p>
      </div>
    )
  }

  if (!user) {
    // The tokens survived the failure (network error, 5xx), so offer a retry
    // instead of bouncing a signed-in teacher back to the sign-in page.
    if (error) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-bg">
          <ErrorState title="Couldn't restore your session" message={error} onRetry={() => void restoreSession()} />
        </div>
      )
    }
    return <Navigate to="/teacher/login" replace state={{ from: `${location.pathname}${location.search}` }} />
  }

  return <Outlet />
}
