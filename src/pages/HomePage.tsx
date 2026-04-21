import { Link } from 'react-router-dom'
import { Container } from '@/components/ui/Container'
import { SITE } from '@/lib/site'

export function HomePage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-5 py-16 text-center">
      <Container size="sm">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Coming soon
        </h1>
        <p className="mt-3 text-base text-muted sm:text-lg">
          {SITE.name} — {SITE.tagline}
        </p>

        <div className="mt-12 text-sm">
          <Link
            to="/privacy-policy"
            className="text-muted transition-colors hover:text-accent-hover"
          >
            Privacy Policy
          </Link>
        </div>
      </Container>
    </div>
  )
}
