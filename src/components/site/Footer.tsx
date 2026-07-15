import { Link } from 'react-router-dom'
import { Logo } from '@/components/marketing/primitives'
import { SITE } from '@/lib/site'

export function Footer() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto w-full max-w-6xl px-5 py-12 sm:px-6">
        <div className="flex flex-col gap-10 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-xs">
            <Logo />
            <p className="mt-3 text-sm leading-relaxed text-muted">
              A personal AI tutor for every student, and a co-pilot for every teacher.
            </p>
            <p className="mt-4 text-sm font-semibold text-accent">{SITE.brandLine}</p>
          </div>

          <div className="flex gap-12 text-sm sm:gap-16">
            <div>
              <h4 className="mb-3 font-bold text-fg">Product</h4>
              <ul className="space-y-2.5 text-muted">
                <li>
                  <a
                    href={SITE.playStoreUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="transition-colors hover:text-fg"
                  >
                    Get the app
                  </a>
                </li>
                <li>
                  <Link to="/schools" className="transition-colors hover:text-fg">
                    For schools
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="mb-3 font-bold text-fg">Company</h4>
              <ul className="space-y-2.5 text-muted">
                <li>
                  <a
                    href={`mailto:${SITE.contactEmail}`}
                    className="transition-colors hover:text-fg"
                  >
                    Contact
                  </a>
                </li>
                <li>
                  <Link to="/privacy-policy" className="transition-colors hover:text-fg">
                    Privacy Policy
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-border pt-6 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
          <span>
            &copy; {new Date().getFullYear()} {SITE.name}. All rights reserved.
          </span>
          <a href={`mailto:${SITE.contactEmail}`} className="transition-colors hover:text-fg">
            {SITE.contactEmail}
          </a>
        </div>
      </div>
    </footer>
  )
}
