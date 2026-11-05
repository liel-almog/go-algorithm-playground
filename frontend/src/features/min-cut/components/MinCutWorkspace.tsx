import { VisualizerPanel } from '../../../components/LabPanels'
import { VisualizerTopbar } from '../../../components/VisualizerTopbar'
import type { MinCutResult } from '../../../lib/apiSchemas'
import type { GraphProblem } from '../minCut'
import { GraphVisualizer } from './GraphVisualizer'

interface MinCutWorkspaceProps {
  graph: GraphProblem
  result: MinCutResult | null
}

export function MinCutWorkspace({ graph, result }: MinCutWorkspaceProps) {
  return (
    <VisualizerPanel className="min-h-[505px]">
      <VisualizerTopbar
        status={result ? 'Minimum cut found' : 'Graph ready'}
        detail={`${graph.vertices.length} vertices · ${graph.edges.length} edges`}
      />
      <GraphVisualizer graph={graph} result={result} />
      <div className="flex h-[49px] items-center justify-end gap-5 border-t px-5 text-xs text-[#7f8881] max-[620px]:justify-center">
        <span className="flex items-center gap-1.5">
          <i className="size-2 rounded-full bg-[#77aa87]" /> Partition A
        </span>
        <span className="flex items-center gap-1.5">
          <i className="size-2 rounded-full bg-[#78a8b8]" /> Partition B
        </span>
        <span className="flex items-center gap-1.5">
          <i className="size-2 rounded-full bg-orange" /> Cut edge
        </span>
      </div>
    </VisualizerPanel>
  )
}
