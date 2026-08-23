import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, Navigate, useLocation } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import { useAuth } from '@/auth/useAuth'
import { Spinner } from '@/components/ui/Spinner'
import { apiErrorMessage } from '@/lib/api'
import { createLinkRequest, linkCodePayload, pollLinkRequest, type LinkRequest, type LinkStatus } from '@/lib/auth'
import { cn } from '@/lib/cn'
import { SITE } from '@/lib/site'

type SignInTab = 'password' | 'link'

const LINK_POLL_INTERVAL_MS = 2000

const LINK_STATE_MESSAGES: Record<Exclude<LinkStatus, 'pending' | 'approved'>, string> = {
  consumed: 'This code has already been used. Get a new one to link this browser.',
  rejected: 'The request was declined on the phone.',
  expired: 'This code has expired.',
}

export function TeacherLoginPage() {
  const { user, signOutReason } = useAuth()
  const location = useLocation()
  const [tab, setTab] = useState<SignInTab>('password')

  // Only in-app destinations are honoured: the classroom itself, or the board
  // whose content drawer sent the teacher here.
  const requestedPath = (location.state as { from?: string } | null)?.from
  const destination =
    requestedPath && (requestedPath.indexOf('/teacher') === 0 || requestedPath.indexOf('/boards') === 0) ? requestedPath : '/teacher'

  if (user) return <Navigate to={destination} replace />

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-bg px-5 py-12">
      <Link to="/" className="mb-8 flex items-center gap-2.5">
        <img src="/logo.png" alt="" className="h-8 w-8 rounded-md bg-white p-0.5" />
        <span className="text-lg font-semibold tracking-tight">{SITE.name}</span>
      </Link>

      <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 sm:p-8">
        <h1 className="text-2xl font-bold text-fg">Teacher sign-in</h1>
        <p className="mt-2 text-sm text-muted">
          Open your classes, chapters and shared study guides on the big screen.
        </p>

        {signOutReason ? (
          <p className="mt-4 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-400">
            {signOutReason}
          </p>
        ) : null}

        <div className="mt-6 flex rounded-lg border border-border p-1">
          <TabButton active={tab === 'password'} onClick={() => setTab('password')} label="Password" />
          <TabButton active={tab === 'link'} onClick={() => setTab('link')} label="Link with phone" />
        </div>

        <div className="mt-6">{tab === 'password' ? <PasswordForm /> : <LinkWithPhonePanel />}</div>
      </div>
    </div>
  )
}

function TabButton({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors',
        active ? 'bg-primary text-primary-fg' : 'text-muted hover:bg-surface-hover hover:text-fg',
      )}
    >
      {label}
    </button>
  )
}

function PasswordForm() {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      // On success the auth state flips and this page redirects into the board.
      await login(email.trim(), password)
    } catch (err) {
      setError(apiErrorMessage(err))
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1.5 text-sm text-muted">
        Email
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
          autoComplete="email"
          className="rounded-lg border border-border bg-bg px-3 py-2.5 text-fg outline-none transition-colors focus:border-primary"
        />
      </label>
      <label className="flex flex-col gap-1.5 text-sm text-muted">
        Password
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
          autoComplete="current-password"
          className="rounded-lg border border-border bg-bg px-3 py-2.5 text-fg outline-none transition-colors focus:border-primary"
        />
      </label>

      {error ? <p className="text-sm text-red-400">{error}</p> : null}

      <button
        type="submit"
        disabled={submitting}
        className="mt-1 inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-fg transition-colors hover:bg-primary-hover disabled:opacity-60"
      >
        {submitting ? <Spinner size="sm" /> : null}
        Sign in
      </button>
    </form>
  )
}

/**
 * QR linking: this browser asks for a code, shows it, and polls until the
 * teacher approves it in the app. The token pair arrives exactly once, on the
 * first poll that sees the approval, so it is adopted immediately.
 */
function LinkWithPhonePanel() {
  const { adoptTokens } = useAuth()
  const [request, setRequest] = useState<LinkRequest | null>(null)
  const [status, setStatus] = useState<LinkStatus>('pending')
  const [error, setError] = useState<string | null>(null)
  // Bumped to ask for a fresh code: by the teacher, or by the poll when the
  // current one runs out before anyone scans it.
  const [codeGeneration, setCodeGeneration] = useState(0)
  const adopted = useRef(false)

  const requestNewCode = useCallback(() => setCodeGeneration((generation) => generation + 1), [])

  useEffect(() => {
    let cancelled = false
    createLinkRequest()
      .then((next) => {
        if (cancelled) return
        setRequest(next)
        setStatus('pending')
        setError(null)
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(apiErrorMessage(err))
      })
    return () => {
      cancelled = true
    }
  }, [codeGeneration])

  useEffect(() => {
    if (!request || status !== 'pending') return
    let cancelled = false

    const poll = () => {
      // A code only lives a couple of minutes, so replace it before the
      // teacher scans something that is already dead.
      if (Date.now() >= request.expires_at) {
        requestNewCode()
        return
      }
      pollLinkRequest(request.code)
        .then((result) => {
          if (cancelled || adopted.current) return
          if (result.status === 'approved' && result.tokens) {
            adopted.current = true
            adoptTokens(result.tokens)
            return
          }
          if (result.status !== 'pending' && result.status !== 'approved') setStatus(result.status)
        })
        .catch((err: unknown) => {
          if (!cancelled) setError(apiErrorMessage(err))
        })
    }

    const interval = window.setInterval(poll, LINK_POLL_INTERVAL_MS)
    return () => {
      cancelled = true
      window.clearInterval(interval)
    }
  }, [request, status, requestNewCode, adoptTokens])

  if (status !== 'pending') {
    return (
      <div className="flex flex-col items-center gap-4 text-center">
        <p className="text-sm text-muted">{LINK_STATE_MESSAGES[status as keyof typeof LINK_STATE_MESSAGES]}</p>
        <NewCodeButton onClick={requestNewCode} />
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-5 text-center">
      {request ? (
        <div className="rounded-2xl bg-white p-4">
          <QRCodeSVG value={linkCodePayload(request.code)} size={200} level="M" />
        </div>
      ) : (
        <div className="flex h-[232px] w-[232px] items-center justify-center rounded-2xl border border-border">
          <Spinner className="text-muted" />
        </div>
      )}

      <p className="text-sm text-muted">
        Open the Edyma app &gt; Profile &gt; Linked devices &gt; Link a device, and scan this code
      </p>

      {error ? (
        <div className="flex flex-col items-center gap-3">
          <p className="text-sm text-red-400">{error}</p>
          <NewCodeButton onClick={requestNewCode} />
        </div>
      ) : null}
    </div>
  )
}

function NewCodeButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-fg transition-colors hover:bg-primary-hover"
    >
      New code
    </button>
  )
}
