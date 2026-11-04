import type { ReactNode } from 'react'

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <span className="text-[0.72rem] font-bold tracking-[0.15em] text-primary uppercase">
      {children}
    </span>
  )
}
