import { Link } from 'react-router-dom'
import { SITE } from '@/lib/site'

export function Footer() {
  return (
    <footer className="border-t border-border/60">
      <div className="mx-auto flex w-full max-w-4xl flex-col items-center justify-between gap-3 px-5 py-6 text-xs text-muted sm:flex-row sm:px-6">
        <span>© {new Date().getFullYear()} {SITE.name}. All rights reserved.</span>
        <Link
          to="/privacy-policy"
          className="transition-colors hover:text-accent-hover"
        >
          Privacy Policy
        </Link>
      </div>
    </footer>
  )
}
