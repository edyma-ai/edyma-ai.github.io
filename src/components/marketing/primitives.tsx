import type { ComponentPropsWithoutRef, ReactNode } from 'react'
import { cn } from '@/lib/cn'
import { SITE } from '@/lib/site'

/** UPPERCASE letter-spaced sky eyebrow that opens most sections. */
export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p
      className={cn(
        'text-xs font-bold uppercase tracking-[0.14em] text-accent',
        className,
      )}
    >
      {children}
    </p>
  )
}

export function SectionHeading({
  eyebrow,
  title,
  sub,
  align = 'center',
  className,
}: {
  eyebrow?: string
  title: ReactNode
  sub?: ReactNode
  align?: 'center' | 'left'
  className?: string
}) {
  return (
    <div
      className={cn(
        align === 'center' ? 'mx-auto max-w-2xl text-center' : 'max-w-2xl text-left',
        className,
      )}
    >
      {eyebrow ? <Eyebrow className={align === 'center' ? '' : ''}>{eyebrow}</Eyebrow> : null}
      <h2 className="mt-3 text-3xl font-extrabold tracking-[-0.02em] text-fg sm:text-4xl">{title}</h2>
      {sub ? <p className="mt-4 text-lg leading-relaxed text-muted">{sub}</p> : null}
    </div>
  )
}

type ButtonProps = {
  href: string
  children: ReactNode
  variant?: 'primary' | 'outline'
  external?: boolean
  className?: string
} & Omit<ComponentPropsWithoutRef<'a'>, 'href' | 'className' | 'children'>

export function ButtonLink({
  href,
  children,
  variant = 'primary',
  external = false,
  className,
  ...rest
}: ButtonProps) {
  const external_props = external ? { target: '_blank', rel: 'noopener noreferrer' } : {}
  return (
    <a
      href={href}
      {...external_props}
      {...rest}
      className={cn(
        'inline-flex items-center justify-center gap-2.5 rounded-[10px] px-6 py-3.5 text-base font-semibold transition-colors',
        variant === 'primary'
          ? 'bg-primary text-primary-fg shadow-[var(--shadow-lift)] hover:bg-primary-hover'
          : 'border border-border bg-card text-fg hover:border-sky-300 hover:bg-surface',
        className,
      )}
    >
      {children}
    </a>
  )
}

export function GooglePlayIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M3.61 1.814A1.82 1.82 0 0 0 3 3.129v17.742a1.82 1.82 0 0 0 .61 1.315l.07.063L14.29 11.64v-.28L3.68 .75l-.07.063zM17.85 15.2l-3.56-3.56v-.28l3.56-3.56.08.046 4.22 2.398c1.205.685 1.205 1.805 0 2.49l-4.22 2.398-.08.046v.018zM17.93 15.156L14.29 11.5 3.68 22.186c.398.42 1.055.47 1.803.053l12.447-7.083zM5.483 1.762L17.93 8.844 14.29 12.5 3.68.814c.398-.42 1.055-.47 1.803-.053z" />
    </svg>
  )
}

export function Logo({ className, withWordmark = true }: { className?: string; withWordmark?: boolean }) {
  return (
    <span className={cn('flex items-center gap-2.5', className)}>
      <img src="/logo.png" alt="Edyma" className="h-7 w-7" />
      {withWordmark ? (
        <span className="text-lg font-extrabold tracking-[-0.02em] text-fg">{SITE.name}</span>
      ) : null}
    </span>
  )
}

/**
 * Subtle constellation motif: faint sky nodes joined by hairlines. Purely
 * decorative background flourish echoing the deck / app brand. Pointer-safe.
 */
export function Constellation({ className }: { className?: string }) {
  return (
    <svg
      className={cn('pointer-events-none absolute', className)}
      viewBox="0 0 400 260"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M32 40 L120 96 L96 188 L212 150 L330 60 L300 176 L212 150"
        stroke="#7DC5F7"
        strokeWidth="1"
        strokeOpacity="0.5"
      />
      {[
        [32, 40],
        [120, 96],
        [96, 188],
        [212, 150],
        [330, 60],
        [300, 176],
      ].map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r={i % 2 === 0 ? 3.5 : 2} fill="#2E9BE6" fillOpacity="0.55" />
      ))}
    </svg>
  )
}
