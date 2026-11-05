import { useMemo } from 'react'
import type { Graph, MinCutResult } from '../../../lib/apiSchemas'
import { cn } from '../../../lib/utils'

interface GraphVisualizerProps {
  graph: Graph
  result: MinCutResult | null
}

export function GraphVisualizer({ graph, result }: GraphVisualizerProps) {
  const positions = useMemo(
    () => layoutVertices(graph.vertices),
    [graph.vertices],
  )
  const partitionA = new Set(result?.partitions[0] ?? [])
  const partitionB = new Set(result?.partitions[1] ?? [])
  const cuts = new Set(
    (result?.crossingEdges ?? []).flatMap((edge) => [
      `${edge.from}-${edge.to}`,
      `${edge.to}-${edge.from}`,
    ]),
  )

  return (
    <div className="relative min-h-[405px] bg-[radial-gradient(circle_at_center,#f9faf6_0,#f3f4ef_70%)] max-[620px]:min-h-[330px]">
      <svg
        className="block h-[405px] w-full max-[620px]:h-[330px]"
        viewBox="0 0 720 450"
        role="img"
        aria-label="Generated graph and minimum cut"
      >
        {graph.edges.map((edge) => {
          const from = positions.get(edge.from)
          const to = positions.get(edge.to)
          if (!from || !to) return null
          const isCut = cuts.has(`${edge.from}-${edge.to}`)
          return (
            <line
              key={`${edge.from}-${edge.to}`}
              x1={from.x}
              y1={from.y}
              x2={to.x}
              y2={to.y}
              className={
                isCut
                  ? 'animate-cut-dash stroke-orange stroke-5 [stroke-dasharray:8_5]'
                  : 'stroke-[#aeb8b0] stroke-2'
              }
            />
          )
        })}
        {graph.vertices.map((vertex) => {
          const position = positions.get(vertex)
          if (!position) return null
          let colors = 'fill-white stroke-[#6f7e73]'
          if (partitionA.has(vertex)) colors = 'fill-[#d9ecdf] stroke-primary'
          if (partitionB.has(vertex)) colors = 'fill-[#dcebf0] stroke-[#568393]'
          return (
            <g key={vertex}>
              <circle
                className={cn(
                  'stroke-2 drop-shadow-[0_5px_5px_#34463a20] transition-[fill,stroke] duration-300 ease-[ease]',
                  colors,
                )}
                cx={position.x}
                cy={position.y}
                r="29"
              />
              <text
                className="fill-[#4b584e] text-center font-mono text-xs leading-[normal] font-medium [dominant-baseline:middle] [text-anchor:middle]"
                x={position.x}
                y={position.y + 1}
              >
                {vertex}
              </text>
            </g>
          )
        })}
      </svg>
      <div
        className={cn(
          'absolute bottom-[13px] left-1/2 -translate-x-1/2 rounded-[5px] border bg-white/87 px-[11px] py-[7px] text-xs',
          result ? 'border-[#e6cbbf] text-[#8b4d34]' : 'text-[#879087]',
        )}
      >
        {result ? (
          <>
            {result.cutSize} crossing {result.cutSize === 1 ? 'edge' : 'edges'}
          </>
        ) : (
          'Run the algorithm to reveal the cut'
        )}
      </div>
    </div>
  )
}

function layoutVertices(vertices: string[]) {
  const centerX = 360
  const centerY = 225
  return new Map(
    vertices.map((vertex, index) => {
      const angle = (index / vertices.length) * Math.PI * 2 - Math.PI / 2
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
}
