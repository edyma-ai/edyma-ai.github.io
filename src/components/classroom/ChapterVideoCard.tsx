import { useCallback, useEffect, useRef, useState } from 'react'
import { ExternalLink, Film } from 'react-feather'
import { formatDuration, youtubeEmbedUrl, type ChapterVideo } from '@/lib/classroom'
import { resolveS3Url } from '@/lib/s3'
import { Spinner } from '@/components/ui/Spinner'

/**
 * One chapter video. `s3` sources stream from a presigned URL that expires
 * after an hour, so a playback error re-resolves the key once before giving
 * up; `youtube` sources embed through the no-cookie host.
 */
export function ChapterVideoCard({ video }: { video: ChapterVideo }) {
  const isS3Video = video.source === 's3'
  const [src, setSrc] = useState<string | null>(null)
  const [poster, setPoster] = useState<string | undefined>(undefined)
  const [failed, setFailed] = useState(false)
  const alreadyRetried = useRef(false)
  const duration = formatDuration(video.duration_sec)

  useEffect(() => {
    if (!isS3Video) return
    let cancelled = false
    resolveS3Url(video.url_or_key)
      .then((url) => {
        if (!cancelled) setSrc(url)
      })
      .catch(() => {
        if (!cancelled) setFailed(true)
      })
    return () => {
      cancelled = true
    }
  }, [isS3Video, video.url_or_key])

  useEffect(() => {
    const key = video.thumbnail_key
    if (!key) return
    let cancelled = false
    resolveS3Url(key)
      .then((url) => {
        if (!cancelled) setPoster(url)
      })
      .catch(() => {
        // A missing poster is cosmetic: the player still works.
      })
    return () => {
      cancelled = true
    }
  }, [video.thumbnail_key])

  const handlePlaybackError = useCallback(() => {
    if (alreadyRetried.current) {
      setFailed(true)
      return
    }
    alreadyRetried.current = true
    resolveS3Url(video.url_or_key, { refresh: true })
      .then(setSrc)
      .catch(() => setFailed(true))
  }, [video.url_or_key])

  const embedUrl = isS3Video ? null : youtubeEmbedUrl(video.url_or_key)

  return (
    <article className="overflow-hidden rounded-2xl border border-border bg-surface">
      <div className="aspect-video w-full bg-black/40">
        {isS3Video ? (
          failed ? (
            <div className="flex h-full items-center justify-center px-4 text-center text-sm text-muted">
              This video could not be loaded right now.
            </div>
          ) : src ? (
            <video
              key={src}
              src={src}
              poster={poster}
              controls
              playsInline
              preload="metadata"
              onError={handlePlaybackError}
              className="h-full w-full"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <Spinner className="text-muted" />
            </div>
          )
        ) : embedUrl ? (
          <iframe
            title={video.title}
            src={embedUrl}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            loading="lazy"
            className="h-full w-full border-0"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <a
              href={video.url_or_key}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-fg transition-colors hover:bg-surface-hover"
            >
              <ExternalLink size={15} />
              Open video
            </a>
          </div>
        )}
      </div>
      <div className="flex items-center gap-2 px-4 py-3">
        <Film size={15} className="shrink-0 text-muted" />
        <p className="min-w-0 flex-1 truncate text-sm font-medium text-fg">{video.title}</p>
        {duration ? <span className="text-xs text-muted">{duration}</span> : null}
      </div>
    </article>
  )
}
