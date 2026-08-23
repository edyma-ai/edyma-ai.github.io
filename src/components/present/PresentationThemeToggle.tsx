import { Moon, Sun } from 'react-feather'
import { cn } from '@/lib/cn'

type PresentationThemeToggleProps = {
  theme: 'light' | 'dark'
  onToggle: () => void
  /** Pinned to the viewport corner by default; false places it inline in a toolbar. */
  floating?: boolean
}

export function PresentationThemeToggle({ theme, onToggle, floating = true }: PresentationThemeToggleProps) {
  const isDark = theme === 'dark'

  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        'rounded-full border border-border bg-surface p-3 text-fg shadow-lg transition-colors hover:bg-surface-hover',
        floating && 'fixed top-4 right-4 z-40',
      )}
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      title={isDark ? 'Light theme' : 'Dark theme'}
    >
      {isDark ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  )
}
