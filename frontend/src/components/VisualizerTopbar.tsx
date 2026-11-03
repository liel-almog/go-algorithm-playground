import type { ReactNode } from 'react'
import styles from './VisualizerTopbar.module.css'

interface VisualizerTopbarProps {
  status: ReactNode
  detail: ReactNode
}

export function VisualizerTopbar({ status, detail }: VisualizerTopbarProps) {
  return (
    <div className="flex h-[50px] items-center justify-between border-b border-border bg-[#fafaf7] px-5 text-[0.56rem] tracking-[0.08em] text-[#7d867f] uppercase">
      <div className="flex items-center gap-[9px] text-[#4c5a50]">
        <span className={styles.liveDot} />
        {status}
      </div>
      <span>{detail}</span>
    </div>
  )
}
