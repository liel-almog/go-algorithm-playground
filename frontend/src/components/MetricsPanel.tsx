import labStyles from './lab.module.css'
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
}

export function MetricsPanel({
  title,
  ariaLabel,
  complete,
  metrics,
}: MetricsPanelProps) {
  return (
    <section className={labStyles['metrics-panel']} aria-label={ariaLabel}>
      <ResultHeading title={title} complete={complete} />
      <div className={labStyles['metrics-grid']}>
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
