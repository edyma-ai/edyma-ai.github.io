import { useCallback, useEffect, useRef, useState } from 'react'
import { Maximize, Minimize, Zap } from 'react-feather'
import { useApiData } from '@/hooks/useApiData'
import { fetchInteractiveElement } from '@/lib/classroom'
import { cn } from '@/lib/cn'
import { Spinner } from '@/components/ui/Spinner'

interface InteractiveEmbedProps {
  elementId: string
  /** Adds a full-screen control over the sim (used on the chapter's Interactive tab). */
  allowFullscreen?: boolean
  className?: string
}

/**
 * A chapter's interactive sim, rendered the way the app's WebView does. The
 * HTML is self-contained (it makes no network calls), so it goes into a
 * sandboxed `srcDoc` iframe with scripts and nothing else allowed, sized to
 * the authored aspect ratio.
 */
export function InteractiveEmbed({ elementId, allowFullscreen = false, className }: InteractiveEmbedProps) {
  const load = useCallback(() => fetchInteractiveElement(elementId), [elementId])
  const element = useApiData(load)
  const frameWrapRef = useRef<HTMLDivElement>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)

  useEffect(() => {
    const onChange = () => setIsFullscreen(Boolean(document.fullscreenElement))
    document.addEventListener('fullscreenchange', onChange)
    return () => document.removeEventListener('fullscreenchange', onChange)
  }, [])

  const toggleFullscreen = useCallback(() => {
    const wrap = frameWrapRef.current
    if (!wrap) return
    if (document.fullscreenElement) void document.exitFullscreen?.()
    else void wrap.requestFullscreen?.().catch(() => {})
  }, [])

  if (element.loading) {
    return (
      <div className={cn('my-3 flex aspect-[4/3] w-full items-center justify-center rounded-xl border border-border bg-surface', className)}>
        <Spinner className="text-muted" />
      </div>
    )
  }

  if (element.error || !element.data) {
    return (
      <div className={cn('my-3 flex items-center gap-2 rounded-xl border border-dashed border-border px-3 py-3 text-sm text-muted', className)}>
        <Zap size={14} />
        This interactive element could not be loaded.
      </div>
    )
  }

  const ratio = element.data.aspect_ratio > 0 ? element.data.aspect_ratio : 4 / 3

  return (
    <figure className={cn('my-4', className)}>
      <div
        ref={frameWrapRef}
        className="relative overflow-hidden rounded-xl border border-border bg-white"
        style={{ aspectRatio: String(ratio) }}
      >
        <iframe
          title={element.data.title}
          srcDoc={element.data.html}
          sandbox="allow-scripts"
          className="h-full w-full border-0"
          loading="lazy"
        />
        {allowFullscreen ? (
          <button
            type="button"
            onClick={toggleFullscreen}
            aria-label={isFullscreen ? 'Exit full screen' : 'Full screen'}
            title={isFullscreen ? 'Exit full screen' : 'Full screen'}
            className="absolute top-2 right-2 flex h-9 w-9 items-center justify-center rounded-full border border-border bg-surface text-fg shadow-lg transition-colors hover:bg-surface-hover"
          >
            {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
          </button>
        ) : null}
      </div>
      <figcaption className="mt-2 flex items-center gap-1.5 text-sm text-muted">
        <Zap size={14} />
        {element.data.title}
      </figcaption>
    </figure>
  )
}
