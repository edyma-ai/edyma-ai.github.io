import { Moon, Sun } from 'react-feather'

type PresentationThemeToggleProps = {
  theme: 'light' | 'dark'
  onToggle: () => void
}

export function PresentationThemeToggle({ theme, onToggle }: PresentationThemeToggleProps) {
  const isDark = theme === 'dark'

  return (
    <button
      type="button"
      onClick={onToggle}
      className="fixed top-4 right-4 z-40 rounded-full border border-border bg-surface p-3 text-fg shadow-lg transition-colors hover:bg-surface-hover"
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      title={isDark ? 'Light theme' : 'Dark theme'}
    >
      {isDark ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  )
}
