import { MetricsPanel } from '../../../components/MetricsPanel'
import type { SolveResult } from '../../../lib/api'
import { formatDuration } from '../../../lib/formatDuration'

interface ResultMetricsProps {
  result: SolveResult | null
}

export function ResultMetrics({ result }: ResultMetricsProps) {
  return (
    <MetricsPanel
      title="Inspect the result"
      ariaLabel="Solution metrics"
      complete={Boolean(result)}
      metrics={[
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
      ]}
    />
  )
}
