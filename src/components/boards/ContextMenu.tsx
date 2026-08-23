// Lightweight right-click menu, positioned at the cursor and clamped to the viewport.
import { useEffect, type ReactNode } from 'react'
import { cn } from '@/lib/cn'

export interface MenuItem {
  label: string
  icon?: ReactNode
  shortcut?: string
  danger?: boolean
  onSelect: () => void
}

interface ContextMenuProps {
  x: number
  y: number
  items: MenuItem[]
  onClose: () => void
}

const MENU_WIDTH = 200
const ITEM_HEIGHT = 34

export function ContextMenu({ x, y, items, onClose }: ContextMenuProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  // Keep the menu on-screen.
  const left = Math.min(x, window.innerWidth - MENU_WIDTH - 8)
  const top = Math.min(y, window.innerHeight - (items.length * ITEM_HEIGHT + 16))

  return (
    <>
      {/* click-away / right-click-away backdrop */}
      <div
        className="fixed inset-0 z-40"
        onMouseDown={onClose}
        onContextMenu={(e) => {
          e.preventDefault()
          onClose()
        }}
      />
      <div
        className="absolute z-50 min-w-[180px] rounded-xl border border-border bg-surface p-1 shadow-2xl"
        style={{ left, top }}
        role="menu"
      >
        {items.map((item) => (
          <button
            key={item.label}
            type="button"
            role="menuitem"
            onClick={() => {
              item.onSelect()
              onClose()
            }}
            className={cn(
              'flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-sm transition-colors',
              item.danger ? 'text-muted hover:bg-red-500/10 hover:text-red-500' : 'text-fg hover:bg-surface-hover hover:text-primary',
            )}
          >
            {item.icon ? <span className="flex h-4 w-4 items-center justify-center text-current">{item.icon}</span> : <span className="h-4 w-4" />}
            <span className="flex-1 text-left">{item.label}</span>
            {item.shortcut ? <span className="text-xs text-muted">{item.shortcut}</span> : null}
          </button>
        ))}
      </div>
    </>
  )
}
