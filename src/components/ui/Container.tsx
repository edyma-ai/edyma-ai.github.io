import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

interface ContainerProps {
  children: ReactNode
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

const sizes = {
  sm: 'max-w-xl',
  md: 'max-w-2xl',
  lg: 'max-w-4xl',
} as const

export function Container({ children, className, size = 'md' }: ContainerProps) {
  return (
    <div className={cn('mx-auto w-full px-5 sm:px-6', sizes[size], className)}>
      {children}
    </div>
  )
}
