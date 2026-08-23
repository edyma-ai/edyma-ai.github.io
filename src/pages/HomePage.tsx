import {
  ArrowRight,
  BookOpen,
  Compass,
  Lock,
  Layers,
  Repeat,
  Target,
  Users,
} from 'react-feather'
import { Container } from '@/components/ui/Container'
import { Navbar } from '@/components/site/Navbar'
import { Footer } from '@/components/site/Footer'
import {
  ButtonLink,
  Constellation,
  Eyebrow,
  GooglePlayIcon,
  SectionHeading,
} from '@/components/marketing/primitives'
import { MindmapCard, ScoreRing, TutorChat } from '@/components/marketing/visuals'
import { SITE } from '@/lib/site'

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-[-30%] left-1/2 h-[560px] w-[820px] -translate-x-1/2 rounded-full bg-primary/8 blur-3xl" />
        <Constellation className="top-10 right-6 hidden h-40 w-64 opacity-70 lg:block" />
      </div>

      <Container size="xl" className="relative py-16 sm:py-24 lg:py-28">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <div className="animate-fade-in-up inline-flex items-center gap-2 rounded-full border border-border bg-card px-3.5 py-1.5 text-sm font-semibold text-accent">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              AI learning for Class 6 to 10
            </div>
            <h1 className="animate-fade-in-up delay-100 mt-5 text-4xl font-extrabold leading-[1.08] tracking-[-0.02em] text-fg sm:text-5xl lg:text-[3.4rem]">
              A personal tutor for every student. A co-pilot for every teacher.
            </h1>
            <p className="animate-fade-in-up delay-200 mt-6 max-w-xl text-lg leading-relaxed text-muted">
              Edyma gives every child a private AI tutor grounded in their own syllabus, and gives
              teachers back the hours they lose to grading and prep.
            </p>
            <div className="animate-fade-in-up delay-300 mt-9 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href={SITE.playStoreUrl} external>
                <GooglePlayIcon />
                Get the app
              </ButtonLink>
              <ButtonLink href="/schools" variant="outline">
                For schools
                <ArrowRight size={16} />
              </ButtonLink>
            </div>
            <p className="animate-fade-in-up delay-400 mt-4 text-sm text-muted">
              Available on Android. iOS coming soon.
            </p>
          </div>

          <div className="animate-fade-in-up delay-200 flex justify-center lg:justify-end">
            <TutorChat />
          </div>
        </div>
      </Container>
    </section>
  )
}

function ShiftSection() {
  return (
    <section className="border-t border-border py-20 sm:py-28">
      <Container size="xl">
        <SectionHeading
          eyebrow="The shift"
          title="Learning is going personal"
          sub="The one-size-fits-all classroom is ending. AI is what makes it inevitable."
        />

        <div className="mx-auto mt-14 grid max-w-4xl items-stretch gap-4 sm:grid-cols-[1fr_auto_1fr]">
          <div className="rounded-[18px] border border-border bg-card p-6">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted">The old way</p>
            <p className="mt-3 text-base font-semibold text-fg">One pace for the whole class</p>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Thirty students, one teacher, everyone on the same page at the same time. It was never
              the best way to learn, only the way that scaled.
            </p>
          </div>
          <div className="flex items-center justify-center py-2 sm:flex-col sm:py-0">
            <div className="flex items-center gap-2 sm:flex-col">
              <ArrowRight className="rotate-90 text-accent sm:rotate-0" size={22} />
              <span className="text-[11px] font-bold uppercase tracking-wide text-accent">
                Scale, solved
              </span>
            </div>
          </div>
          <div className="rounded-[18px] border border-sky-300 bg-surface p-6">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-accent">The new way</p>
            <p className="mt-3 text-base font-semibold text-fg">Each child on their own path</p>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              A tutor for every student and a co-pilot for every teacher. Personal learning, at the
              pace of each child, is now affordable for a whole school.
            </p>
          </div>
        </div>

        <div className="mx-auto mt-6 flex max-w-4xl items-center gap-4 rounded-[18px] bg-fg p-6 text-left">
          <p className="tabular shrink-0 text-4xl font-extrabold text-sky-300 sm:text-5xl">98%</p>
          <p className="text-sm leading-relaxed text-white/80 sm:text-base">
            A tutored child outperforms 98% of a normal classroom. Bloom proved it in 1984. The
            missing piece was scale, and AI just supplied it.
          </p>
        </div>
      </Container>
    </section>
  )
}

const GUARANTEES = [
  {
    icon: Compass,
    title: 'It never just hands over the answer',
    body: 'Edyma asks the next question back and walks your child to the answer themselves, so they actually learn it rather than copy it.',
  },
  {
    icon: BookOpen,
    title: 'It only knows their syllabus',
    body: 'Their chapters, their board, their class. Grounded in what they are actually studying, not the open internet.',
  },
  {
    icon: Lock,
    title: 'Private by design',
    body: "A child's conversations stay theirs. Teachers see progress and insight, never the chat itself.",
  },
]

function TutorSection() {
  return (
    <section className="border-t border-border bg-card py-20 sm:py-28">
      <Container size="xl">
        <SectionHeading
          eyebrow="The tutor"
          title="Ask anything, any time"
          sub="The doubt a child will never raise in front of thirty classmates, they can ask Edyma at 10pm."
        />
        <div className="mt-14 grid gap-5 sm:grid-cols-3">
          {GUARANTEES.map(({ icon: Icon, title, body }) => (
            <div key={title} className="rounded-[18px] border border-border bg-bg p-7">
              <span className="inline-flex rounded-xl bg-violet-muted p-3 text-violet">
                <Icon size={22} />
              </span>
              <h3 className="mt-5 text-lg font-bold text-fg">{title}</h3>
              <p className="mt-2.5 leading-relaxed text-muted">{body}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  )
}

const REVISION = [
  { icon: Layers, title: 'Understand it', body: 'Mindmaps that lay out a whole chapter at a glance.' },
  { icon: Repeat, title: 'Make it stick', body: 'Flashcards and quick recall on the topics they keep missing.' },
  { icon: Target, title: 'Prove it', body: 'Timed mock tests, marked instantly, so they walk in exam-ready.' },
]

function RevisionSection() {
  return (
    <section className="border-t border-border py-20 sm:py-28">
      <Container size="xl">
        <div className="grid items-center gap-14 lg:grid-cols-2">
          <div>
            <Eyebrow>Revision</Eyebrow>
            <h2 className="mt-3 text-3xl font-extrabold tracking-[-0.02em] text-fg sm:text-4xl">
              From the gap to exam-ready
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-muted">
              Edyma finds what a child is weak at, drills exactly that, then proves it with a timed
              mock. The whole loop, on their own syllabus.
            </p>
            <div className="mt-8 space-y-5">
              {REVISION.map(({ icon: Icon, title, body }) => (
                <div key={title} className="flex gap-4">
                  <span className="mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-muted text-accent">
                    <Icon size={20} />
                  </span>
                  <div>
                    <h3 className="font-bold text-fg">{title}</h3>
                    <p className="mt-1 text-muted">{body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col items-center gap-5">
            <div className="flex w-full max-w-sm flex-col items-center rounded-[22px] border border-border bg-card p-8 shadow-[var(--shadow-card)]">
              <ScoreRing value={80} />
              <p className="mt-4 text-lg font-bold text-green">Exam-ready</p>
              <p className="text-sm text-muted">Timed mock · Photosynthesis</p>
            </div>
            <MindmapCard className="max-w-sm" />
          </div>
        </div>
      </Container>
    </section>
  )
}

function TracksSection() {
  return (
    <section className="border-t border-border bg-card py-20 sm:py-28">
      <Container size="xl">
        <SectionHeading eyebrow="Two ways in" title="For your child, and for their school" />
        <div className="mt-14 grid gap-6 md:grid-cols-2">
          <div className="flex flex-col rounded-[22px] border border-border bg-bg p-8">
            <span className="inline-flex w-fit rounded-xl bg-primary-muted p-3 text-accent">
              <Users size={24} />
            </span>
            <h3 className="mt-5 text-2xl font-extrabold text-fg">For your child</h3>
            <p className="mt-3 flex-1 leading-relaxed text-muted">
              Give your child a personal AI tutor. Download Edyma and they can start learning on
              their own syllabus today, with revision tools that turn a weak topic into an
              exam-ready one.
            </p>
            <ButtonLink href={SITE.playStoreUrl} external className="mt-7 w-fit">
              <GooglePlayIcon />
              Get the app
            </ButtonLink>
          </div>

          <div className="flex flex-col rounded-[22px] border border-sky-300 bg-surface p-8">
            <span className="inline-flex w-fit rounded-xl bg-card p-3 text-accent">
              <BookOpen size={24} />
            </span>
            <h3 className="mt-5 text-2xl font-extrabold text-fg">For schools</h3>
            <p className="mt-3 flex-1 leading-relaxed text-muted">
              Bring Edyma to your classrooms. A co-pilot that drafts material and grades for
              teachers, live insight for leaders, and a weekly progress update parents actually
              read.
            </p>
            <ButtonLink href="/schools" variant="outline" className="mt-7 w-fit border-accent text-accent">
              Explore Edyma for schools
              <ArrowRight size={16} />
            </ButtonLink>
          </div>
        </div>
      </Container>
    </section>
  )
}

const FAQS = [
  {
    q: 'Which classes and boards is Edyma for?',
    a: 'Edyma is built for Class 6 to 10 and is grounded in your child’s own syllabus, whatever the board.',
  },
  {
    q: 'Will it just give my child the answers?',
    a: 'No. Edyma is built to guide, not to hand over answers. It walks a child to the solution one step at a time, so they learn how to get there.',
  },
  {
    q: 'Is it safe and private?',
    a: 'Yes. A student’s conversations stay private to them, the app requests only the minimum permissions it needs, and data is handled responsibly under applicable data-protection law.',
  },
  {
    q: 'Does it replace the teacher?',
    a: 'Edyma is a co-pilot, not a replacement. For schools, it removes busywork so teachers can spend more time teaching, and nothing reaches a student until the teacher approves it.',
  },
  {
    q: 'What devices does it need?',
    a: 'Edyma runs on Android today, on the phones students already have. iOS is coming soon.',
  },
  {
    q: 'How do we bring Edyma to our school?',
    a: 'Head to the For schools page and get in touch. We start with a single class, on the screens your school already owns.',
  },
]

function FaqSection() {
  return (
    <section className="border-t border-border py-20 sm:py-28">
      <Container size="lg">
        <SectionHeading eyebrow="Questions" title="What parents and schools ask" />
        <div className="mx-auto mt-12 max-w-3xl divide-y divide-border overflow-hidden rounded-[18px] border border-border bg-card">
          {FAQS.map(({ q, a }) => (
            <details key={q} className="group px-6 py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-bold text-fg">
                {q}
                <ArrowRight
                  size={18}
                  className="shrink-0 text-accent transition-transform group-open:rotate-90"
                />
              </summary>
              <p className="mt-3 leading-relaxed text-muted">{a}</p>
            </details>
          ))}
        </div>
      </Container>
    </section>
  )
}

function CtaSection() {
  return (
    <section className="relative overflow-hidden border-t border-border bg-fg py-20 sm:py-28">
      <Constellation className="right-8 top-8 hidden h-40 w-64 opacity-40 sm:block" />
      <Container size="sm" className="relative text-center">
        <h2 className="text-3xl font-extrabold tracking-[-0.02em] text-white sm:text-4xl">
          Give every student a tutor of their own
        </h2>
        <p className="mt-4 text-lg leading-relaxed text-white/70">
          Download Edyma and start learning on your own syllabus today.
        </p>
        <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <ButtonLink href={SITE.playStoreUrl} external>
            <GooglePlayIcon />
            Get the app
          </ButtonLink>
          <ButtonLink
            href="/schools"
            variant="outline"
            className="border-white/25 bg-transparent text-white hover:border-white/50 hover:bg-white/10"
          >
            For schools
            <ArrowRight size={16} />
          </ButtonLink>
        </div>
      </Container>
    </section>
  )
}

export function HomePage() {
  return (
    <>
      <Navbar />
      <Hero />
      <ShiftSection />
      <TutorSection />
      <RevisionSection />
      <TracksSection />
      <FaqSection />
      <CtaSection />
      <Footer />
    </>
  )
}
