import type { ComponentProps, ReactNode } from 'react'
import { cn } from '../lib/utils'

export function PageSection({
  className,
  ...props
}: ComponentProps<'section'>) {
  return (
    <section
      className={cn(
        'mx-auto w-[min(1180px,calc(100%-48px))] max-[620px]:w-[calc(100%-28px)]',
        className,
      )}
      {...props}
    />
  )
}

export function LabLayout({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto grid w-[min(1180px,calc(100%-48px))] grid-cols-[265px_minmax(0,1fr)] items-start gap-4 max-[900px]:grid-cols-1 max-[620px]:w-[calc(100%-28px)]">
      {children}
    </div>
  )
}
