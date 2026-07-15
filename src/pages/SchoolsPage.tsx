import {
  BarChart2,
  BookOpen,
  CheckCircle,
  Edit3,
  Mail,
  MessageCircle,
  Monitor,
  Server,
  Shield,
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
import { DashboardCard, ScoreRing, WhatsappCard } from '@/components/marketing/visuals'
import { TeamSection } from '@/components/marketing/TeamSection'
import { SITE } from '@/lib/site'

const MAILTO = `mailto:${SITE.contactEmail}?subject=${encodeURIComponent('Edyma for our school')}`

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-[-30%] left-1/2 h-[520px] w-[820px] -translate-x-1/2 rounded-full bg-primary/8 blur-3xl" />
        <Constellation className="top-12 right-8 hidden h-40 w-64 opacity-70 lg:block" />
      </div>
      <Container size="xl" className="relative py-16 sm:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <Eyebrow>For schools</Eyebrow>
          <h1 className="animate-fade-in-up mt-4 text-4xl font-extrabold leading-[1.08] tracking-[-0.02em] text-fg sm:text-5xl">
            Upgrade the classroom you already have
          </h1>
          <p className="animate-fade-in-up delay-100 mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted">
            Edyma turns the boards and phones your school already owns into an AI-powered classroom.
            A tutor for every student, a co-pilot for every teacher, and live insight for you.
          </p>
          <div className="animate-fade-in-up delay-200 mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <ButtonLink href={MAILTO}>
              <Mail size={18} />
              Talk to us
            </ButtonLink>
            <ButtonLink href={SITE.playStoreUrl} variant="outline" external>
              <GooglePlayIcon />
              See the student app
            </ButtonLink>
          </div>
        </div>
      </Container>
    </section>
  )
}

const PILLARS = [
  { icon: Users, title: 'Students', body: 'A private AI tutor and revision suite, on their own syllabus.' },
  { icon: BookOpen, title: 'Teachers', body: 'A co-pilot that drafts material and grades the class.' },
  { icon: Monitor, title: 'Classroom', body: 'Lessons brought to life on the screens you already own.' },
  { icon: BarChart2, title: 'Administration', body: 'Live performance and engagement, class by class.' },
  { icon: MessageCircle, title: 'Parents', body: 'A short weekly progress update they actually read.' },
]

function PillarsSection() {
  return (
    <section className="border-t border-border bg-card py-20 sm:py-28">
      <Container size="xl">
        <SectionHeading eyebrow="The platform" title="One upgrade, felt by everyone" />
        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {PILLARS.map(({ icon: Icon, title, body }) => (
            <div key={title} className="rounded-[18px] border border-border bg-bg p-5">
              <span className="inline-flex rounded-xl bg-primary-muted p-2.5 text-accent">
                <Icon size={20} />
              </span>
              <h3 className="mt-4 font-bold text-fg">{title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">{body}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  )
}

const TEACHER_POINTS = [
  {
    icon: Edit3,
    title: 'Study material, drafted for them',
    body: 'Edyma prepares syllabus-aligned material. Teachers review, edit, and share it in a few taps.',
  },
  {
    icon: CheckCircle,
    title: 'A whole class, marked in minutes',
    body: 'Assignments come back graded, with feedback that tells each child what to fix, not just a number.',
  },
  {
    icon: Shield,
    title: 'The teacher stays in control',
    body: 'Edyma augments teachers, it does not replace them. Nothing reaches a student until the teacher approves it.',
  },
]

function TeachersSection() {
  return (
    <section className="border-t border-border py-20 sm:py-28">
      <Container size="xl">
        <div className="grid items-center gap-14 lg:grid-cols-2">
          <div>
            <Eyebrow>Teachers</Eyebrow>
            <h2 className="mt-3 text-3xl font-extrabold tracking-[-0.02em] text-fg sm:text-4xl">
              Give teachers their hours back
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-muted">
              Edyma drafts the study material and grades the class, so teachers spend their time
              teaching, not on paperwork.
            </p>
            <div className="mt-8 space-y-5">
              {TEACHER_POINTS.map(({ icon: Icon, title, body }) => (
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
          <div className="flex justify-center">
            <div className="flex w-full max-w-sm flex-col items-center rounded-[22px] border border-border bg-card p-8 shadow-[var(--shadow-card)]">
              <ScoreRing value={82} />
              <p className="mt-4 text-lg font-bold text-fg">Marked and returned</p>
              <p className="text-center text-sm text-muted">
                With feedback that shows the student what to fix
              </p>
            </div>
          </div>
        </div>
      </Container>
    </section>
  )
}

function ClassroomSection() {
  return (
    <section className="border-t border-border bg-card py-20 sm:py-28">
      <Container size="lg">
        <SectionHeading
          eyebrow="Classroom"
          title="Lessons, brought to life on the board"
          sub="Edyma works with the screens you already own to bring any lesson to life in class."
        />
        <div className="mx-auto mt-12 grid max-w-3xl gap-4 sm:grid-cols-2">
          <div className="flex items-center gap-3 rounded-[18px] border border-border bg-bg px-6 py-5">
            <Server size={22} className="shrink-0 text-accent" />
            <p className="font-semibold text-fg">No new hardware</p>
          </div>
          <div className="flex items-center gap-3 rounded-[18px] border border-border bg-bg px-6 py-5">
            <Monitor size={22} className="shrink-0 text-accent" />
            <p className="font-semibold text-fg">
              Works with the LED screens and smart panels you already have
            </p>
          </div>
        </div>
      </Container>
    </section>
  )
}

function AdminSection() {
  return (
    <section className="border-t border-border py-20 sm:py-28">
      <Container size="xl">
        <div className="grid items-center gap-14 lg:grid-cols-2">
          <div>
            <Eyebrow>Administration</Eyebrow>
            <h2 className="mt-3 text-3xl font-extrabold tracking-[-0.02em] text-fg sm:text-4xl">
              See how every class is really doing
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-muted">
              A live view of performance and engagement, class by class. You see the insight, never a
              student's private conversation.
            </p>
          </div>
          <div className="flex justify-center">
            <DashboardCard className="max-w-md" />
          </div>
        </div>
      </Container>
    </section>
  )
}

function ParentsSection() {
  return (
    <section className="border-t border-border bg-card py-20 sm:py-28">
      <Container size="xl">
        <div className="grid items-center gap-14 lg:grid-cols-2">
          <div className="order-2 flex justify-center lg:order-1">
            <WhatsappCard />
          </div>
          <div className="order-1 lg:order-2">
            <Eyebrow>Parents</Eyebrow>
            <h2 className="mt-3 text-3xl font-extrabold tracking-[-0.02em] text-fg sm:text-4xl">
              Keep every parent in the loop
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-muted">
              Parents get a short, specific weekly update on their child's progress, so they stay
              involved and the school stays the trusted voice.
            </p>
          </div>
        </div>
      </Container>
    </section>
  )
}

const SETUP = [
  { icon: Server, title: 'No new hardware', body: 'Their phones, the panels you already bought.' },
  { icon: Edit3, title: 'We handle setup', body: 'Syllabus alignment, content, and student accounts, done by us.' },
  { icon: Users, title: 'A two-day teacher workshop', body: 'Hands-on, in your school, run by our team.' },
]

function SetupSection() {
  return (
    <section className="border-t border-border py-20 sm:py-28">
      <Container size="xl">
        <SectionHeading eyebrow="Getting started" title="The setup is on us" />
        <div className="mt-14 grid gap-5 sm:grid-cols-3">
          {SETUP.map(({ icon: Icon, title, body }) => (
            <div key={title} className="rounded-[18px] border border-border bg-card p-7">
              <span className="inline-flex rounded-xl bg-primary-muted p-3 text-accent">
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

function CtaSection() {
  return (
    <section className="relative overflow-hidden border-t border-border bg-fg py-20 sm:py-28">
      <Constellation className="right-8 top-8 hidden h-40 w-64 opacity-40 sm:block" />
      <Container size="sm" className="relative text-center">
        <h2 className="text-3xl font-extrabold tracking-[-0.02em] text-white sm:text-4xl">
          Bring Edyma to your school
        </h2>
        <p className="mt-4 text-lg leading-relaxed text-white/70">
          Start with a single class, on the screens you already own. We will walk you through it on
          your own syllabus.
        </p>
        <div className="mt-9 flex justify-center">
          <ButtonLink href={MAILTO}>
            <Mail size={18} />
            Email us
          </ButtonLink>
        </div>
      </Container>
    </section>
  )
}

export function SchoolsPage() {
  return (
    <>
      <Navbar />
      <Hero />
      <PillarsSection />
      <TeachersSection />
      <ClassroomSection />
      <AdminSection />
      <ParentsSection />
      <SetupSection />
      <TeamSection />
      <CtaSection />
      <Footer />
    </>
  )
}
