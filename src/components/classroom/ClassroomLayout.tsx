import { Link, Outlet } from 'react-router-dom'
import { Edit3, LogOut } from 'react-feather'
import { useAuth } from '@/auth/useAuth'
import { SITE } from '@/lib/site'

/** Chrome shared by every Classroom Board page: home link, who is signed in, sign out. */
export function ClassroomLayout() {
  const { user, logout } = useAuth()

  return (
    <div className="flex min-h-screen flex-col bg-bg">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-bg/85 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-5 py-3 sm:px-6">
          <Link to="/" className="flex items-center gap-2.5">
            <img src="/logo.png" alt="" className="h-7 w-7 rounded-md bg-white p-0.5" />
            <span className="text-base font-semibold tracking-tight">{SITE.name}</span>
            <span className="hidden text-sm text-muted sm:inline">Classroom Board</span>
          </Link>
          <div className="flex items-center gap-3">
            {user ? <span className="hidden text-sm text-muted sm:inline">{user.display_name}</span> : null}
            <Link
              to="/boards"
              className="inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium text-muted transition-colors hover:bg-surface-hover hover:text-fg"
            >
              <Edit3 size={15} />
              Boards
            </Link>
            <button
              type="button"
              onClick={() => void logout()}
              className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-fg transition-colors hover:border-muted hover:bg-surface-hover"
            >
              <LogOut size={15} />
              Sign out
            </button>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  )
}
