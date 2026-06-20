import { useCallback, useEffect, useRef, useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'

import { PresentationContent } from '@/components/present/PresentationContent'
import { PresentationThemeToggle } from '@/components/present/PresentationThemeToggle'
import { cn } from '@/lib/cn'
import {
  createHostSession,
  getPresentationStatus,
  presentationCodePayload,
  type PresentationHostResponse,
  type TlmSection,
} from '@/lib/presentations'

type ViewState = 'waiting' | 'presenting' | 'ended'
type PresentTheme = 'light' | 'dark'

const PRESENT_THEME_KEY = 'edyma-present-theme'

function readPresentTheme(): PresentTheme {
  if (typeof window === 'undefined') return 'light'
  return localStorage.getItem(PRESENT_THEME_KEY) === 'dark' ? 'dark' : 'light'
}

export function PresentPage() {
  const [view, setView] = useState<ViewState>('waiting')
  const [host, setHost] = useState<PresentationHostResponse | null>(null)
  const [title, setTitle] = useState('')
  const [sections, setSections] = useState<TlmSection[]>([])
  const [error, setError] = useState<string | null>(null)
  const [theme, setTheme] = useState<PresentTheme>(() => readPresentTheme())
  const hostRef = useRef<PresentationHostResponse | null>(null)

  const toggleTheme = useCallback(() => {
    setTheme((current) => {
      const next: PresentTheme = current === 'dark' ? 'light' : 'dark'
      localStorage.setItem(PRESENT_THEME_KEY, next)
      return next
    })
  }, [])

  const refreshHost = useCallback(async () => {
    try {
      const data = await createHostSession()
      hostRef.current = data
      setHost(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to start presentation display')
    }
  }, [])

  useEffect(() => {
    const init = async () => {
      await refreshHost()
    }
    void init()
  }, [refreshHost])

  useEffect(() => {
    if (view !== 'waiting' && view !== 'presenting') return
    const sessionId = hostRef.current?.session_id
    if (!sessionId) return

    const poll = async () => {
      const currentHost = hostRef.current
      if (!currentHost) return

      const now = Date.now()
      if (view === 'waiting' && now >= currentHost.expires_at) {
        await refreshHost()
        return
      }

      try {
        const data = await getPresentationStatus(sessionId)
        if (data.status === 'ended') {
          setView('ended')
          return
        }
        // Only load content once — status polls return fresh presigned image
        // URLs each time, which would otherwise remount images in a load loop.
        if (view === 'waiting' && data.status === 'connected' && data.sections?.length) {
          setTitle(data.title ?? '')
          setSections(data.sections)
          setView('presenting')
        }
      } catch {
        setView('ended')
      }
    }

    void poll()
    const intervalMs = view === 'presenting' ? 5000 : 3000
    const interval = window.setInterval(() => {
      void poll()
    }, intervalMs)

    return () => window.clearInterval(interval)
  }, [view, host?.session_id, refreshHost])

  if (view === 'presenting' && sections.length > 0) {
    return (
      <div className={cn('min-h-screen bg-bg', theme === 'light' && 'present-theme-light')}>
        <PresentationThemeToggle theme={theme} onToggle={toggleTheme} />
        <PresentationContent title={title} sections={sections} />
      </div>
    )
  }

  if (view === 'ended') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg px-6">
        <div className="max-w-md rounded-2xl border border-border bg-surface p-8 text-center">
          <h1 className="text-2xl font-semibold text-fg">Presentation ended</h1>
          <p className="mt-3 text-muted">
            The teacher has disconnected this session. You can close this page.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-6 py-10">
      <div className="flex w-full max-w-md flex-col items-center gap-8 text-center">
        <div>
          <h1 className="text-3xl font-bold text-fg">Ready to present</h1>
          <p className="mt-2 text-muted">
            Open the Edyma app, tap Present → Open in Web, then scan this code or enter it
            manually.
          </p>
        </div>

        {host ? (
          <>
            <div className="rounded-2xl bg-white p-6">
              <QRCodeSVG value={presentationCodePayload(host.code)} size={240} level="M" />
            </div>
            <div>
              <p className="text-sm text-muted">Presentation code</p>
              <p className="mt-2 text-4xl font-bold tracking-[0.35em] text-fg">{host.code}</p>
            </div>
            <p className="text-sm text-muted">Waiting for connection…</p>
          </>
        ) : (
          <p className="text-muted">Starting presentation display…</p>
        )}

        {error ? <p className="text-sm text-red-400">{error}</p> : null}
      </div>
    </div>
  )
}
