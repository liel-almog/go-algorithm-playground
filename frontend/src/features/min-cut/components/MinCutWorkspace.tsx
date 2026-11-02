import { VisualizerTopbar } from '../../../components/VisualizerTopbar'
import type { MinCutResult } from '../../../lib/api'
import type { GraphProblem } from '../minCut'
import { GraphVisualizer } from './GraphVisualizer'

interface MinCutWorkspaceProps {
  graph: GraphProblem
  result: MinCutResult | null
}

export function MinCutWorkspace({ graph, result }: MinCutWorkspaceProps) {
  return (
    <section className="visualizer-panel graph-panel">
      <VisualizerTopbar
        status={result ? 'Minimum cut found' : 'Graph ready'}
        detail={`${graph.vertices.length} vertices · ${graph.edges.length} edges`}
      />
      <GraphVisualizer graph={graph} result={result} />
      <div className="graph-legend">
        <span>
          <i className="legend-a" /> Partition A
        </span>
        <span>
          <i className="legend-b" /> Partition B
        </span>
        <span>
          <i className="legend-cut" /> Cut edge
        </span>
      </div>
    </section>
  )
}
