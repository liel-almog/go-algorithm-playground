import { Link, createFileRoute } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import { LabHeader } from './algorithms.$algorithmId'
import { api } from '../lib/api'
import type { Edge, MinCutResult } from '../lib/api'

export const Route = createFileRoute('/algorithms/karger')({
  component: KargerPage,
})

type GraphProblem = { vertices: string[]; edges: Edge[] }

function KargerPage() {
  const [vertexCount, setVertexCount] = useState(7)
  const [trials, setTrials] = useState(90)
  const [graph, setGraph] = useState(() => generateGraph(7))
  const [result, setResult] = useState<MinCutResult | null>(null)
  const [isSolving, setIsSolving] = useState(false)
  const [error, setError] = useState('')

  const regenerate = () => {
    setGraph(generateGraph(vertexCount))
    setResult(null)
    setError('')
  }

  const solve = async () => {
    setIsSolving(true)
    setError('')
    setResult(null)
    try {
      setResult(await api.minimumCut(graph.vertices, graph.edges, trials))
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : 'The backend did not respond.',
      )
    } finally {
      setIsSolving(false)
    }
  }

  return (
    <div className="lab-page graph-lab">
      <LabHeader
        eyebrow="randomized graph · minimum cut"
        title="Karger’s algorithm"
        description="Contract random edges again and again until two groups remain. Repeated trials turn a lucky guess into a dependable result."
        badge="Probabilistic result"
      />

      <div className="lab-layout section-wrap">
        <aside className="control-panel">
          <div className="panel-heading">
            <span>01</span>
            <div>
              <strong>Generate a problem</strong>
              <p>Build a connected graph with a hidden bottleneck.</p>
            </div>
          </div>
          <label className="range-control">
            <span>
              Vertices <strong>{vertexCount}</strong>
            </span>
            <input
              type="range"
              min="5"
              max="10"
              value={vertexCount}
              onChange={(event) => setVertexCount(Number(event.target.value))}
            />
            <small>
              <span>5</span>
              <span>10</span>
            </small>
          </label>
          <button
            className="button button-secondary button-full"
            onClick={regenerate}
          >
            <span aria-hidden="true">↻</span> Generate new graph
          </button>

          <div className="panel-divider" />
          <div className="panel-heading">
            <span>02</span>
            <div>
              <strong>Ask the backend</strong>
              <p>Repeat random contractions and keep the smallest cut.</p>
            </div>
          </div>
          <label className="range-control">
            <span>
              Trials <strong>{trials}</strong>
            </span>
            <input
              type="range"
              min="10"
              max="250"
              step="10"
              value={trials}
              onChange={(event) => setTrials(Number(event.target.value))}
            />
            <small>
              <span>Quick</span>
              <span>Confident</span>
            </small>
          </label>
          <button
            className="button button-primary button-full"
            onClick={() => void solve()}
            disabled={isSolving}
          >
            {isSolving ? (
              <span className="spinner" />
            ) : (
              <span aria-hidden="true">▶</span>
            )}
            {isSolving ? 'Contracting…' : 'Find minimum cut'}
          </button>
          {error && (
            <div className="error-message" role="alert">
              <strong>Couldn’t calculate the cut</strong>
              <span>{error}</span>
            </div>
          )}
          <div className="request-preview">
            <span>Request</span>
            <code>
              POST /api/graphs/min-cut
              <br />
              trials: {trials}
            </code>
          </div>
        </aside>

        <section className="visualizer-panel graph-panel">
          <div className="visualizer-topbar">
            <div>
              <span className="live-dot" />
              {result ? 'Minimum cut found' : 'Graph ready'}
            </div>
            <span>
              {graph.vertices.length} vertices · {graph.edges.length} edges
            </span>
          </div>
          <GraphVisual graph={graph} result={result} />
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

        <section className="metrics-panel" aria-label="Minimum cut metrics">
          <div className="metrics-heading">
            <div>
              <span>03</span>
              <strong>Inspect the result</strong>
            </div>
            {result && <i>complete</i>}
          </div>
          <div className="metrics-grid graph-metrics">
            <div>
              <span>Minimum cut</span>
              <strong>{result?.cutSize ?? '—'}</strong>
              <small>edges</small>
            </div>
            <div>
              <span>Confidence</span>
              <strong>{result ? `${result.confidence}%` : '—'}</strong>
              <small>estimate</small>
            </div>
            <div>
              <span>Trials run</span>
              <strong>{result?.trials ?? '—'}</strong>
              <small>attempts</small>
            </div>
            <div>
              <span>Time</span>
              <strong>
                {result ? formatGraphTime(result.durationUs) : '—'}
              </strong>
              <small>{result ? '' : 'runtime'}</small>
            </div>
          </div>
        </section>
      </div>
      <div className="next-lab section-wrap">
        <span>Try another family</span>
        <Link to="/algorithms/$algorithmId" params={{ algorithmId: 'astar' }}>
          Explore informed search →
        </Link>
      </div>
    </div>
  )
}

function GraphVisual({
  graph,
  result,
}: {
  graph: GraphProblem
  result: MinCutResult | null
}) {
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

function generateGraph(count: number): GraphProblem {
  const vertices = Array.from({ length: count }, (_, index) =>
    String.fromCharCode(65 + index),
  )
  const edges: Edge[] = []
  const seen = new Set<string>()
  const addEdge = (from: string, to: string) => {
    const key = [from, to].sort().join('-')
    if (from !== to && !seen.has(key)) {
      seen.add(key)
      edges.push({ from, to })
    }
  }

  for (let index = 0; index < count; index += 1) {
    addEdge(vertices[index], vertices[(index + 1) % count])
  }
  for (let index = 0; index < count; index += 1) {
    addEdge(vertices[index], vertices[(index + 2) % count])
  }
  const extras = Math.max(1, Math.floor(count / 3))
  for (let index = 0; index < extras; index += 1) {
    const from = vertices[Math.floor(Math.random() * count)]
    const to = vertices[Math.floor(Math.random() * count)]
    addEdge(from, to)
  }
  return { vertices, edges }
}

function formatGraphTime(microseconds: number) {
  return microseconds < 1000
    ? `${microseconds} μs`
    : `${(microseconds / 1000).toFixed(1)} ms`
}
