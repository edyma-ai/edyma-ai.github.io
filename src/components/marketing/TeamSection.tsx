import { Container } from '@/components/ui/Container'
import { SectionHeading } from '@/components/marketing/primitives'

const FOUNDERS = [
  {
    name: 'Harsh Sharma',
    role: 'Co-founder & CEO',
    expertise: 'AI & product',
    school: 'IIT Kharagpur',
    photo: '/team/harsh.png',
  },
  {
    name: 'Praneeth Reddy',
    role: 'Co-founder & CTO',
    expertise: 'AI infrastructure & scale',
    school: 'IIT Kharagpur',
    photo: '/team/praneeth.jpg',
  },
  {
    name: 'Sarvesh Sharma',
    role: 'Co-founder, GTM & Strategy',
    expertise: 'Go-to-market & growth',
    school: '',
    photo: '/team/sarvesh.jpg',
  },
]

export function TeamSection() {
  return (
    <section className="border-t border-border py-20 sm:py-28">
      <Container size="xl">
        <SectionHeading
          eyebrow="The team"
          title="The team behind Edyma"
          sub="Deep AI engineering, real product experience, and years of on-the-ground sales."
        />
        <div className="mx-auto mt-14 grid max-w-3xl gap-8 sm:grid-cols-3">
          {FOUNDERS.map((f) => (
            <div key={f.name} className="flex flex-col items-center text-center">
              <div className="h-28 w-28 overflow-hidden rounded-full bg-surface ring-4 ring-sky-300/40">
                <img src={f.photo} alt={f.name} className="h-full w-full object-cover" />
              </div>
              <h3 className="mt-4 text-lg font-bold text-fg">{f.name}</h3>
              <p className="mt-0.5 text-sm text-muted">{f.role}</p>
              <p className="mt-2 text-sm font-semibold text-fg">{f.expertise}</p>
              {f.school ? <p className="mt-0.5 text-sm text-muted">{f.school}</p> : null}
            </div>
          ))}
        </div>
      </Container>
    </section>
  )
}
