import type { ReactNode } from 'react'

interface VisualizerTopbarProps {
  status: ReactNode
  detail: ReactNode
}

export function VisualizerTopbar({ status, detail }: VisualizerTopbarProps) {
  return (
    <div className="visualizer-topbar">
      <div>
        <span className="live-dot" />
        {status}
      </div>
      <span>{detail}</span>
    </div>
  )
}
