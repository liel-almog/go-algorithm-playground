import type { ReactNode } from 'react'
import styles from './VisualizerTopbar.module.css'

interface VisualizerTopbarProps {
  status: ReactNode
  detail: ReactNode
}

export function VisualizerTopbar({ status, detail }: VisualizerTopbarProps) {
  return (
    <div className="flex min-h-[50px] flex-wrap items-center justify-between gap-x-4 gap-y-1 border-b border-border bg-[#fafaf7] px-5 py-2 text-[0.65rem] tracking-[0.06em] text-[#7d867f] uppercase max-[620px]:px-4">
      <div className="flex min-w-0 items-center gap-[9px] text-[#4c5a50]">
        <span className={styles.liveDot} />
        {status}
      </div>
      <span>{detail}</span>
    </div>
  )
}
