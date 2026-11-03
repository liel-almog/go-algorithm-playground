import { MetricsPanel } from '../../../components/MetricsPanel'
import type { MinCutResult } from '../../../lib/api'
import { formatGraphTime } from '../minCut'

interface MinCutMetricsProps {
  result: MinCutResult | null
}

export function MinCutMetrics({ result }: MinCutMetricsProps) {
  return (
    <MetricsPanel
      title="Inspect the result"
      ariaLabel="Minimum cut metrics"
      complete={Boolean(result)}
      metrics={[
        {
          label: 'Minimum cut',
          value: result?.cutSize ?? '—',
          suffix: 'edges',
        },
        {
          label: 'Confidence',
          value: result ? `${result.confidence}%` : '—',
          suffix: 'estimate',
        },
        {
          label: 'Trials run',
          value: result?.trials ?? '—',
          suffix: 'attempts',
        },
        {
          label: 'Time',
          value: result ? formatGraphTime(result.durationUs) : '—',
          suffix: result ? '' : 'runtime',
        },
      ]}
    />
  )
}
