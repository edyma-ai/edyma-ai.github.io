import { Link } from 'react-router-dom'
import { GooglePlayIcon, Logo } from '@/components/marketing/primitives'
import { SITE } from '@/lib/site'

export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 border-b border-border/70 bg-bg/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3.5 sm:px-6">
        <Link to="/" aria-label="Edyma home">
          <Logo />
        </Link>

        <div className="flex items-center gap-2.5 sm:gap-3">
          <Link
            to="/teacher/login"
            className="hidden rounded-[10px] px-3 py-2 text-sm font-semibold text-muted transition-colors hover:bg-surface hover:text-fg sm:inline-flex"
          >
            Teacher sign-in
          </Link>
          <Link
            to="/schools"
            className="inline-flex items-center gap-2 rounded-[10px] border-2 border-accent px-3.5 py-2 text-sm font-bold text-accent transition-colors hover:bg-primary-muted sm:px-4"
          >
            For schools
          </Link>
          <a
            href={SITE.playStoreUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-[10px] bg-primary px-3.5 py-2 text-sm font-semibold text-primary-fg shadow-[var(--shadow-lift)] transition-colors hover:bg-primary-hover sm:px-4"
          >
            <GooglePlayIcon size={16} />
            <span className="hidden sm:inline">Get the app</span>
            <span className="sm:hidden">App</span>
          </a>
        </div>
      </div>
    </nav>
  )
}
