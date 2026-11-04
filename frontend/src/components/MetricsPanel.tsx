import type { ReactNode } from 'react'
import { ResultsPanel } from './LabPanels'
import { ResultHeading } from './ResultHeading'

export interface Metric {
  label: string
  value: ReactNode
  suffix: ReactNode
}

interface MetricsPanelProps {
  title: string
  ariaLabel: string
  complete: boolean
  metrics: Metric[]
}

export function MetricsPanel({
  title,
  ariaLabel,
  complete,
  metrics,
}: MetricsPanelProps) {
  return (
    <ResultsPanel aria-label={ariaLabel}>
      <ResultHeading title={title} complete={complete} />
      <div className="grid grid-cols-4 max-[620px]:grid-cols-2">
        {metrics.map((metric) => (
          <div
            key={metric.label}
            className="flex min-w-0 flex-col justify-center border-l border-[#e6e8e2] p-[clamp(12px,1.5vw,22px)] first:border-l-0 min-[901px]:max-[1120px]:border-t max-[620px]:nth-3:border-l-0 max-[620px]:nth-[n+3]:border-t"
          >
            <span className="text-xs tracking-[0.08em] text-muted-foreground uppercase">
              {metric.label}
            </span>
            <strong className="mt-1.5 font-mono text-[1.15rem] leading-[normal] font-medium wrap-anywhere text-secondary-foreground">
              {metric.value}
            </strong>
            <small className="text-xs text-muted-foreground">
              {metric.suffix}
            </small>
          </div>
        ))}
      </div>
    </ResultsPanel>
  )
}
