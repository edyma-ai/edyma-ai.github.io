import { Link } from 'react-router-dom'
import { GooglePlayIcon } from '@/components/site/GooglePlayIcon'
import { SITE } from '@/lib/site'

export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 border-b border-border/40 bg-bg/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-6">
        <a href="/" className="flex items-center gap-2.5">
          <img src="/logo.png" alt="" className="h-7 w-7 rounded-md bg-white p-0.5" />
          <span className="text-lg font-semibold tracking-tight">{SITE.name}</span>
        </a>
        <div className="flex items-center gap-2">
          <Link
            to="/teacher/login"
            className="rounded-lg px-3 py-2 text-sm font-medium text-muted transition-colors hover:bg-surface hover:text-fg"
          >
            Teacher sign-in
          </Link>
          <a
            href={SITE.playStoreUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-fg transition-colors hover:bg-primary-hover"
          >
            <GooglePlayIcon />
            <span className="hidden sm:inline">Get the App</span>
            <span className="sm:hidden">Download</span>
          </a>
        </div>
      </div>
    </nav>
  )
}
