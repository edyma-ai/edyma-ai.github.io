import { useEffect, useState } from 'react'
import type { ExtraProps } from 'react-markdown'

type MarkdownImageProps = React.ImgHTMLAttributes<HTMLImageElement> & ExtraProps

export function MarkdownImage({ src, alt }: MarkdownImageProps) {
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState(false)
  const [lightbox, setLightbox] = useState(false)

  useEffect(() => {
    setLoaded(false)
    setError(false)
  }, [src])

  if (!src) {
    return (
      <span className="markdown-image-error">
        <BrokenImageIcon />
        Image unavailable
      </span>
    )
  }

  if (error) {
    return (
      <span className="markdown-image-error">
        <BrokenImageIcon />
        Image unavailable
      </span>
    )
  }

  return (
    <>
      <div className="markdown-image-wrap">
        {!loaded ? (
          <span className="markdown-image-placeholder">
            <span className="markdown-spinner" aria-hidden="true" />
            Loading image…
          </span>
        ) : null}
        <img
          src={src}
          alt={alt ?? ''}
          className="markdown-image"
          style={{ display: loaded ? 'block' : 'none' }}
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
          onClick={() => setLightbox(true)}
        />
      </div>
      {lightbox && loaded ? (
        <div
          className="markdown-lightbox"
          role="dialog"
          aria-label={alt ?? 'Image preview'}
          onClick={() => setLightbox(false)}
        >
          <img src={src} alt={alt ?? ''} onClick={(event) => event.stopPropagation()} />
        </div>
      ) : null}
    </>
  )
}

function BrokenImageIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="m8 15 3-3 2 2 3-4 3 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="m3 7 4-2 14 10 4-4v8H3V7Z" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  )
}
