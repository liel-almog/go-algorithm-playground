import type { ComponentProps, ReactNode } from 'react'
import { cn } from '../lib/utils'

export function ControlPanel({ children }: { children: ReactNode }) {
  return (
    <aside className="sticky top-4 row-span-2 min-w-0 rounded-[9px] border bg-white/72 p-6 max-[900px]:static max-[900px]:row-auto max-[620px]:p-4.5">
      {children}
    </aside>
  )
}

export function PanelDivider() {
  return <div className="-mx-6 my-[25px] h-px bg-border max-[620px]:-mx-4.5" />
}

export function VisualizerPanel({
  className,
  ...props
}: ComponentProps<'section'>) {
  return (
    <section
      className={cn(
        'min-h-[510px] min-w-0 overflow-hidden rounded-[9px] border bg-white/72 shadow-[0_15px_45px_#28352c0d]',
        className,
      )}
      {...props}
    />
  )
}

export function ResultsPanel({
  className,
  ...props
}: ComponentProps<'section'>) {
  return (
    <section
      className={cn(
        'col-start-2 grid min-h-28 min-w-0 grid-cols-[190px_minmax(0,1fr)] overflow-hidden rounded-[9px] border bg-white/72',
        'min-[901px]:max-[1120px]:grid-cols-1 max-[900px]:col-start-1 max-[620px]:grid-cols-1',
        className,
      )}
      {...props}
    />
  )
}

export function DottedSurface({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'bg-[radial-gradient(#c9cec7_0.7px,transparent_0.7px)] bg-size-[22px_22px]',
        className,
      )}
      {...props}
    />
  )
}
