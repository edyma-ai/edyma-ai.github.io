import type { ReactNode } from 'react'

interface SiteLayoutProps {
  children: ReactNode
}

export function SiteLayout({ children }: SiteLayoutProps) {
  return (
    <div className="flex min-h-dvh flex-col">
      <main className="flex flex-1 flex-col">{children}</main>
    </div>
  )
}
