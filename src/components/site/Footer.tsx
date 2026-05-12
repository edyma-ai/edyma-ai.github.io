import { Link } from 'react-router-dom'
import { SITE } from '@/lib/site'

export function Footer() {
  return (
    <footer className="border-t border-border/60">
      <div className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-6">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-2.5">
              <img src="/logo.png" alt="" className="h-6 w-6 rounded-md bg-white p-0.5" />
              <span className="text-base font-semibold tracking-tight">{SITE.name}</span>
            </div>
            <p className="mt-2 max-w-xs text-sm text-muted">
              AI-powered academic platform built by IIT engineers.
            </p>
          </div>

          <div className="flex gap-12 text-sm">
            <div>
              <h4 className="mb-3 font-medium">Product</h4>
              <ul className="space-y-2 text-muted">
                <li>
                  <a
                    href={SITE.playStoreUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="transition-colors hover:text-fg"
                  >
                    Download App
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="mb-3 font-medium">Legal</h4>
              <ul className="space-y-2 text-muted">
                <li>
                  <Link to="/privacy-policy" className="transition-colors hover:text-fg">
                    Privacy Policy
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="mb-3 font-medium">Contact</h4>
              <ul className="space-y-2 text-muted">
                <li>
                  <a
                    href={`mailto:${SITE.contactEmail}`}
                    className="transition-colors hover:text-fg"
                  >
                    {SITE.contactEmail}
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-border/40 pt-6 text-center text-xs text-muted">
          &copy; {new Date().getFullYear()} {SITE.name}. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
