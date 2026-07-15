import { cn } from '@/lib/cn'

/**
 * Illustrative, hand-coded product visuals in the Edyma app design system.
 * These are brand-accurate representations, not screenshots, and contain no
 * real app UI or customer data.
 */

function Arrow() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="shrink-0 text-accent">
      <path
        d="M5 12h14M13 6l6 6-6 6"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function LeafGlyph() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 20c0-8 6-14 16-16C18 12 12 18 4 20Z" fill="#1FA463" />
      <path d="M4.5 19.5C8 14 12 11 16.5 9" stroke="#EAF4FD" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

/** The illustrative diagram Edyma replies with (the "image" in the answer). */
function PhotosynthesisDiagram() {
  return (
    <div className="rounded-xl border border-border bg-card p-2.5">
      <div className="flex items-center justify-between gap-1.5">
        <div className="flex flex-col gap-1">
          {['Sunlight', 'Water', 'CO₂'].map((l) => (
            <span
              key={l}
              className="rounded-md bg-sky-50 px-1.5 py-0.5 text-center text-[10px] font-semibold text-fg"
            >
              {l}
            </span>
          ))}
        </div>
        <Arrow />
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green/10">
          <LeafGlyph />
        </span>
        <Arrow />
        <div className="flex flex-col gap-1">
          {['Glucose', 'Oxygen'].map((l) => (
            <span
              key={l}
              className="rounded-md bg-green/10 px-1.5 py-0.5 text-center text-[10px] font-semibold text-green"
            >
              {l}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

/** A tutor chat that shows a short, illustrated answer that guides with a follow-up. */
export function TutorChat({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'w-full max-w-sm rounded-[22px] border border-border bg-card p-4 shadow-[var(--shadow-card)]',
        className,
      )}
    >
      <div className="flex items-center gap-2.5 border-b border-border pb-3">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-muted">
          <span className="h-2.5 w-2.5 rounded-full bg-violet" />
        </span>
        <div>
          <p className="text-sm font-bold text-fg">Ask Edyma</p>
          <p className="text-[11px] text-muted">Science · Class 8 · Photosynthesis</p>
        </div>
        <span className="ml-auto rounded-full bg-surface px-2 py-0.5 text-[10px] font-semibold text-accent">
          Private
        </span>
      </div>

      <div className="space-y-3 pt-4">
        <div className="ml-auto max-w-[80%] rounded-2xl rounded-tr-sm bg-primary px-3.5 py-2.5 text-sm text-primary-fg">
          Explain photosynthesis simply
        </div>
        <div className="max-w-[92%] space-y-2.5 rounded-2xl rounded-tl-sm bg-surface px-3.5 py-3 text-sm text-fg">
          <p>Plants make their own food from sunlight, water, and air. Like this:</p>
          <PhotosynthesisDiagram />
          <p className="font-semibold text-fg">Which one do you think the plant gives back to the air?</p>
        </div>
        <div className="flex gap-2">
          <span className="rounded-full border border-border bg-card px-3 py-1 text-xs font-semibold text-fg">
            Oxygen
          </span>
          <span className="rounded-full border border-border bg-card px-3 py-1 text-xs font-semibold text-muted">
            Glucose
          </span>
          <span className="rounded-full border border-border bg-card px-3 py-1 text-xs font-semibold text-muted">
            Water
          </span>
        </div>
      </div>
    </div>
  )
}

/** SVG progress ring used for exam-readiness and grading visuals. */
export function ScoreRing({
  value,
  label,
  size = 128,
}: {
  value: number
  label?: string
  size?: number
}) {
  const stroke = 10
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const dash = (value / 100) * c
  const color = value >= 80 ? '#1FA463' : value >= 60 ? '#2E9BE6' : '#FFB23E'
  return (
    <div className="inline-flex flex-col items-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} r={r} stroke="#E4EDF5" strokeWidth={stroke} fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={color}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${c}`}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
        <text
          x="50%"
          y="50%"
          dominantBaseline="central"
          textAnchor="middle"
          className="tabular"
          fontSize={size * 0.26}
          fontWeight={800}
          fill="#101B2D"
        >
          {value}
        </text>
      </svg>
      {label ? <p className="mt-2 text-sm font-semibold text-fg">{label}</p> : null}
    </div>
  )
}

/** A small chapter mind-map sketch. */
export function MindmapCard({ className }: { className?: string }) {
  const nodes = ['Light reactions', 'Chlorophyll', 'Glucose', 'Stomata']
  return (
    <div
      className={cn(
        'w-full rounded-[18px] border border-border bg-card p-5 shadow-[var(--shadow-card)]',
        className,
      )}
    >
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-accent">Chapter map</p>
      <div className="relative mt-4 flex items-center justify-center">
        <span className="z-10 rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-fg">
          Photosynthesis
        </span>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2.5">
        {nodes.map((n) => (
          <span
            key={n}
            className="rounded-xl border border-border bg-surface px-3 py-2 text-center text-xs font-semibold text-fg"
          >
            {n}
          </span>
        ))}
      </div>
    </div>
  )
}

/** Coded admin dashboard tile: KPIs, per-class bars, and an AI insight strip. */
export function DashboardCard({ className }: { className?: string }) {
  const classes = [
    { name: 'Class 8-A', score: 86 },
    { name: 'Class 8-B', score: 74 },
    { name: 'Class 9-A', score: 81 },
    { name: 'Class 9-B', score: 68 },
  ]
  const kpis = [
    { label: 'Avg score', value: '83' },
    { label: 'Students', value: '480' },
    { label: 'Tutor chats', value: '1.2k' },
  ]
  return (
    <div
      className={cn(
        'w-full rounded-[18px] border border-border bg-card p-5 shadow-[var(--shadow-card)]',
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <span className="h-6 w-6 rounded-md bg-primary/10 p-1">
          <img src="/logo.png" alt="" className="h-full w-full object-contain" />
        </span>
        <p className="text-sm font-bold text-fg">Edyma Academy</p>
        <span className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-green/10 px-2 py-0.5 text-[10px] font-semibold text-green">
          <span className="h-1.5 w-1.5 rounded-full bg-green" /> Live
        </span>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2.5">
        {kpis.map((k) => (
          <div key={k.label} className="rounded-xl border border-border bg-surface px-3 py-2.5">
            <p className="tabular text-xl font-extrabold text-fg">{k.value}</p>
            <p className="mt-0.5 text-[11px] text-muted">{k.label}</p>
          </div>
        ))}
      </div>

      <p className="mt-4 text-[11px] font-semibold text-muted">How every class is doing</p>
      <div className="mt-2 space-y-2">
        {classes.map((c) => (
          <div key={c.name} className="flex items-center gap-3">
            <span className="w-16 shrink-0 text-[11px] font-semibold text-fg">{c.name}</span>
            <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-surface">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${c.score}%`,
                  backgroundColor: c.score >= 80 ? '#1FA463' : c.score >= 60 ? '#2E9BE6' : '#FFB23E',
                }}
              />
            </div>
            <span className="tabular w-7 text-right text-[11px] font-bold text-fg">{c.score}</span>
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-start gap-2 rounded-xl bg-violet-muted p-3">
        <span className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-violet" />
        <p className="text-[11px] leading-relaxed text-fg">
          Class 8-B is trailing the school by 9 points. A revision session on last week's chapter is
          suggested.
        </p>
      </div>
    </div>
  )
}

/** Coded WhatsApp-style weekly parent digest. */
export function WhatsappCard({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'w-full max-w-xs rounded-[22px] border border-border bg-card p-4 shadow-[var(--shadow-card)]',
        className,
      )}
    >
      <div className="flex items-center gap-2.5 border-b border-border pb-3">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-green/10">
          <span className="h-2.5 w-2.5 rounded-full bg-green" />
        </span>
        <div>
          <p className="text-sm font-bold text-fg">Edyma</p>
          <p className="text-[11px] text-muted">Weekly update</p>
        </div>
      </div>
      <div className="space-y-2.5 pt-4 text-sm">
        <p className="font-semibold text-fg">Aarav's week</p>
        <ul className="space-y-1.5 text-[13px] text-fg">
          <li className="flex gap-2">
            <span className="text-green">✓</span> Mastered: Photosynthesis
          </li>
          <li className="flex gap-2">
            <span className="text-accent">→</span> Improving: Cell structure
          </li>
          <li className="flex gap-2">
            <span className="text-amber">!</span> Needs help: Balancing equations
          </li>
          <li className="flex gap-2 text-muted">
            <span>·</span> Studied 4 of 5 days
          </li>
        </ul>
        <p className="rounded-xl bg-surface px-3 py-2 text-[12px] text-muted">
          Tip: ask him why leaves look green. He learned it this week.
        </p>
      </div>
    </div>
  )
}
