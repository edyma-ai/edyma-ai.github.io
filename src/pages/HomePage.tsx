import { BookOpen, Users, BarChart2, Heart, ArrowRight } from 'react-feather'
import { Container } from '@/components/ui/Container'
import { GooglePlayIcon } from '@/components/site/GooglePlayIcon'
import { Navbar } from '@/components/site/Navbar'
import { SITE } from '@/lib/site'
import { Footer } from '@/components/site/Footer'

const STAKEHOLDERS = [
  {
    icon: BookOpen,
    title: 'For Teachers',
    description:
      'AI-powered classroom tools — from lesson planning to performance tracking. Everything a teacher needs to deliver better learning outcomes, in one place.',
  },
  {
    icon: Users,
    title: 'For Students',
    description:
      'Always-on learning support with instant doubt resolution, engaging lessons, and intelligent revision — available around the clock, across all core subjects.',
  },
  {
    icon: BarChart2,
    title: 'For School Leaders',
    description:
      'A live dashboard with school-wide academic insights. Identify learning gaps well before they show up in exam results.',
  },
  {
    icon: Heart,
    title: 'For Parents',
    description:
      "Automated, data-backed progress reports on your child's academic journey — building consistent trust between home and school.",
  },
] as const

function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-[-40%] left-1/2 h-[600px] w-[800px] -translate-x-1/2 rounded-full bg-primary/8 blur-3xl" />
        <div className="absolute top-[-20%] left-1/3 h-[400px] w-[400px] -translate-x-1/2 rounded-full bg-accent/6 blur-3xl" />
      </div>

      <Container size="xl" className="relative py-24 sm:py-32 lg:py-40">
        <div className="mx-auto max-w-3xl text-center">
          <div className="animate-fade-in-up mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary-muted px-4 py-1.5 text-sm text-primary">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary" />
            AI-powered personalized learning at scale
          </div>

          <h1 className="animate-fade-in-up delay-100 text-4xl leading-tight font-bold tracking-tight sm:text-5xl lg:text-6xl">
            One AI platform for{' '}
            <span className="bg-linear-to-r from-accent to-accent-hover bg-clip-text text-transparent">
              your entire school
            </span>
          </h1>

          <p className="animate-fade-in-up delay-200 mt-6 text-lg leading-relaxed text-muted sm:text-xl">
            A single platform that supports your teachers in the classroom, keeps students from
            falling behind, and keeps parents consistently informed.
          </p>

          <div className="animate-fade-in-up delay-300 mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a
              href={SITE.playStoreUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full items-center justify-center gap-2.5 rounded-xl bg-primary px-7 py-3.5 text-base font-semibold text-primary-fg transition-colors hover:bg-primary-hover sm:w-auto"
            >
              <GooglePlayIcon />
              Download on Google Play
            </a>
            <a
              href="#features"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border px-7 py-3.5 text-base font-medium text-fg transition-colors hover:border-muted hover:bg-surface sm:w-auto"
            >
              Learn more
              <ArrowRight size={16} />
            </a>
          </div>
        </div>
      </Container>
    </section>
  )
}

function StakeholderSection() {
  return (
    <section id="features" className="border-t border-border/40 py-24 sm:py-32">
      <Container size="xl">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Designed for every stakeholder
          </h2>
          <p className="mt-4 text-lg text-muted">
            Edyma brings teachers, students, school leaders, and parents onto a single platform —
            each with tools built for their specific needs.
          </p>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2">
          {STAKEHOLDERS.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="group rounded-2xl border border-border/60 bg-surface p-8 transition-colors hover:border-primary/30 hover:bg-surface-hover"
            >
              <div className="mb-5 inline-flex rounded-xl bg-primary-muted p-3 text-primary">
                <Icon size={24} />
              </div>
              <h3 className="text-xl font-semibold">{title}</h3>
              <p className="mt-3 leading-relaxed text-muted">{description}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  )
}

function TrustSection() {
  return (
    <section className="border-t border-border/40 py-24 sm:py-32">
      <Container size="xl">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Why schools trust Edyma</h2>
          <p className="mt-4 text-lg text-muted">
            Edyma combines deep technical expertise with a genuine understanding of Indian
            classrooms — built from the ground up to make a real difference.
          </p>

          <div className="mt-14 grid gap-8 sm:grid-cols-3">
            <div>
              <div className="text-3xl font-bold text-primary">AI-first</div>
              <p className="mt-2 text-sm text-muted">
                Purpose-built AI that adapts to every student, teacher, and school
              </p>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary">All-in-one</div>
              <p className="mt-2 text-sm text-muted">
                Teaching, learning, analytics, and communication — unified in a single platform
              </p>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary">Built for India</div>
              <p className="mt-2 text-sm text-muted">
                Designed for the real-world dynamics of Indian schools and their communities
              </p>
            </div>
          </div>
        </div>
      </Container>
    </section>
  )
}

function CTASection() {
  return (
    <section className="relative overflow-hidden border-t border-border/40 py-24 sm:py-32">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute bottom-[-30%] left-1/2 h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-primary/6 blur-3xl" />
      </div>

      <Container size="sm" className="relative text-center">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Ready to transform your school?
        </h2>
        <p className="mt-4 text-lg text-muted">
          Download Edyma and see the difference AI-powered learning makes — for every classroom,
          every student, every parent.
        </p>
        <div className="mt-10">
          <a
            href={SITE.playStoreUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2.5 rounded-xl bg-primary px-8 py-4 text-base font-semibold text-primary-fg transition-colors hover:bg-primary-hover"
          >
            <GooglePlayIcon />
            Download on Google Play
          </a>
        </div>
        <p className="mt-6 text-sm text-muted">Available on Android. iOS coming soon.</p>
      </Container>
    </section>
  )
}

export function HomePage() {
  return (
    <>
      <Navbar />
      <HeroSection />
      <StakeholderSection />
      <TrustSection />
      <CTASection />
      <Footer />
    </>
  )
}
