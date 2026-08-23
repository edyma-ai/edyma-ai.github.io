// Distinct, colorful tool glyphs for the board toolbar. Each tool has its own
// silhouette + accent color so they read apart at a glance:
//   pen → upright blue-nib pen · pencil → diagonal amber pencil ·
//   highlighter → fat yellow marker · eraser → angled pink block.
// Outlines use currentColor (so they follow the theme / active state); accents
// are fixed brand-ish colors that pop on both light and dark docks.

interface IconProps {
  size?: number
}

export function PenIcon({ size = 22 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M9 4.6A1.6 1.6 0 0 1 10.6 3h2.8A1.6 1.6 0 0 1 15 4.6V13l-3 7-3-7z"
        fill="currentColor"
        fillOpacity="0.1"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path d="M9 8.5h6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M12 13v3" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" />
      <circle cx="12" cy="18.6" r="1.15" fill="#3b82f6" />
    </svg>
  )
}

export function PencilIcon({ size = 22 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 20l1-4L15 6l3 3L8 19z"
        fill="#f59e0b"
        fillOpacity="0.18"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path d="M13 8l3 3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M5 16l3 3" stroke="#f59e0b" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M4 20l1.8-1.8" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  )
}

export function HighlighterIcon({ size = 22 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="7.3" y="3" width="9.4" height="5" rx="1.3" fill="#facc15" fillOpacity="0.55" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M8 8h8v4.6l-1.6 3.4H9.6L8 12.6z"
        fill="currentColor"
        fillOpacity="0.08"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M9.4 20h5.2" stroke="#facc15" strokeWidth="3" strokeLinecap="round" />
    </svg>
  )
}

export function EraserIcon({ size = 22 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 16.4l8.4-8.4a2 2 0 0 1 2.8 0l2.8 2.8a2 2 0 0 1 0 2.8L13.6 19H7z"
        fill="#f472b6"
        fillOpacity="0.28"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path d="M10 10.4l5 5" stroke="currentColor" strokeWidth="1.7" />
      <path d="M6.6 19H19.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  )
}

// Clear board: a broom sweeping the canvas clean — a distinct silhouette (and
// neutral tint, not pink) so it never reads like the eraser tool, nor the
// top-bar "delete board" trash.
export function ClearIcon({ size = 20 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {/* handle */}
      <path d="M20.5 3.5 13 11" />
      {/* brush head */}
      <path d="M10.6 8.6 15.4 13.4l-3.1 3.1a3 3 0 0 1-2.6.85l-4.2-.7a1 1 0 0 1-.6-1.7z" fill="#f59e0b" fillOpacity="0.18" />
      {/* bristles */}
      <path d="m7.7 13 2.5 2.5M9.9 11.4l2.3 2.3" strokeOpacity="0.6" />
      {/* swept floor + motion crumbs */}
      <path d="M5 20h13" />
      <path d="M19.5 20H21M3 20h.5" strokeOpacity="0.5" />
    </svg>
  )
}
