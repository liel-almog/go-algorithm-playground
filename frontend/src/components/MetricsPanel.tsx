import type { ReactNode } from 'react'
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
  gridClassName?: string
}

export function MetricsPanel({
  title,
  ariaLabel,
  complete,
  metrics,
  gridClassName = '',
}: MetricsPanelProps) {
  return (
    <section className="metrics-panel" aria-label={ariaLabel}>
      <ResultHeading title={title} complete={complete} />
      <div className={`metrics-grid ${gridClassName}`.trim()}>
        {metrics.map((metric) => (
          <div key={metric.label}>
            <span>{metric.label}</span>
            <strong>{metric.value}</strong>
            <small>{metric.suffix}</small>
          </div>
        ))}
      </div>
    </section>
  )
}
