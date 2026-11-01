import { useMemo } from 'react'
import type { SolveResult } from '../../../lib/api'
import { formatDuration } from '../puzzle'

export function ResultMetrics({ result }: { result: SolveResult | null }) {
  const metrics = useMemo(
    () => [
      {
        label: 'Path length',
        value: result?.moveCount ?? '—',
        suffix: 'moves',
      },
      {
        label: 'States explored',
        value: result?.expanded ?? '—',
        suffix: 'nodes',
      },
      {
        label: 'Peak frontier',
        value: result?.frontierMax ?? '—',
        suffix: 'states',
      },
      {
        label: 'Time',
        value: result ? formatDuration(result.durationUs) : '—',
        suffix: result ? '' : 'runtime',
      },
    ],
    [result],
  )

  return (
    <section className="metrics-panel" aria-label="Solution metrics">
      <div className="metrics-heading">
        <div>
          <span>03</span>
          <strong>Inspect the result</strong>
        </div>
        {result && <i>complete</i>}
      </div>
      <div className="metrics-grid">
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
