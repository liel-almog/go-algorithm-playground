import type { ReactNode } from 'react'

interface VisualizerTopbarProps {
  status: ReactNode
  detail: ReactNode
}

export function VisualizerTopbar({ status, detail }: VisualizerTopbarProps) {
  return (
    <div className="flex min-h-[50px] flex-wrap items-center justify-between gap-x-4 gap-y-1 border-b border-border bg-[#fafaf7] px-5 py-2 text-xs tracking-[0.06em] text-muted-foreground uppercase max-[620px]:px-4">
      <div className="flex min-w-0 items-center gap-[9px] text-[#4c5a50]">
        <span className="size-[7px] flex-none rounded-full bg-[#4ba56e] shadow-[0_0_0_5px_#4ba56e18]" />
        {status}
      </div>
      <span>{detail}</span>
    </div>
  )
}
