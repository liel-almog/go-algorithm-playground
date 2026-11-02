import { useMemo } from 'react'
import type { Graph, MinCutResult } from '../../../lib/api'

interface GraphVisualizerProps {
  graph: Graph
  result: MinCutResult | null
}

export function GraphVisualizer({ graph, result }: GraphVisualizerProps) {
  const positions = useMemo(() => {
    const centerX = 360
    const centerY = 225
    return new Map(
      graph.vertices.map((vertex, index) => {
        const angle =
          (index / graph.vertices.length) * Math.PI * 2 - Math.PI / 2
        const radius = index % 2 === 0 ? 155 : 175
        return [
          vertex,
          {
            x: centerX + Math.cos(angle) * radius,
            y: centerY + Math.sin(angle) * radius,
          },
        ]
      }),
    )
  }, [graph.vertices])
  const partitionA = new Set(result?.partitions[0] ?? [])
  const partitionB = new Set(result?.partitions[1] ?? [])
  const cuts = new Set(
    (result?.crossingEdges ?? []).flatMap((edge) => [
      `${edge.from}-${edge.to}`,
      `${edge.to}-${edge.from}`,
    ]),
  )

  return (
    <div className="graph-stage">
      <svg
        viewBox="0 0 720 450"
        role="img"
        aria-label="Generated graph and minimum cut"
      >
        {graph.edges.map((edge) => {
          const from = positions.get(edge.from)!
          const to = positions.get(edge.to)!
          const isCut = cuts.has(`${edge.from}-${edge.to}`)
          return (
            <line
              key={`${edge.from}-${edge.to}`}
              x1={from.x}
              y1={from.y}
              x2={to.x}
              y2={to.y}
              className={isCut ? 'cut-edge' : ''}
            />
          )
        })}
        {graph.vertices.map((vertex) => {
          const position = positions.get(vertex)!
          const group = partitionA.has(vertex)
            ? 'partition-a'
            : partitionB.has(vertex)
              ? 'partition-b'
              : ''
          return (
            <g key={vertex} className={group}>
              <circle cx={position.x} cy={position.y} r="29" />
              <text x={position.x} y={position.y + 1}>
                {vertex}
              </text>
            </g>
          )
        })}
      </svg>
      {!result && (
        <div className="graph-hint">Run the algorithm to reveal the cut</div>
      )}
      {result && (
        <div className="cut-label">
          {result.cutSize} crossing {result.cutSize === 1 ? 'edge' : 'edges'}
        </div>
      )}
    </div>
  )
}
