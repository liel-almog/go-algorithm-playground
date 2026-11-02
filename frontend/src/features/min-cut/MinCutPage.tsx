import { useMutation } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { useCallback, useEffect, useRef, useState } from 'react'
import { ConceptExplainer } from '../../components/ConceptExplainer'
import { LabHeader } from '../../components/LabHeader'
import type { MinCutResult } from '../../lib/api'
import { solveMinCutLocally } from '../../lib/clientAlgorithms'
import { MinCutControls } from './components/MinCutControls'
import { MinCutMetrics } from './components/MinCutMetrics'
import { MinCutWorkspace } from './components/MinCutWorkspace'
import { formatError, generateLocalGraph } from './minCut'
import { minCutMutations } from './mutations'

export function MinCutPage() {
  const [vertexCount, setVertexCount] = useState(7)
  const [trials, setTrials] = useState(90)
  const [graph, setGraph] = useState(() => generateLocalGraph(7))
  const [result, setResult] = useState<MinCutResult | null>(null)
  const [fallbackError, setFallbackError] = useState('')
  const didGenerate = useRef(false)
  const generation = useMutation(minCutMutations.generate())
  const solver = useMutation(minCutMutations.solve())
  const error = fallbackError || formatError(solver.error)

  const regenerate = useCallback(
    async (vertices = vertexCount) => {
      setResult(null)
      setFallbackError('')
      generation.reset()
      solver.reset()
      try {
        setGraph(await generation.mutateAsync({ vertices }))
      } catch {
        setGraph(generateLocalGraph(vertices))
        generation.reset()
      }
    },
    [generation, solver, vertexCount],
  )

  useEffect(() => {
    if (didGenerate.current) return
    didGenerate.current = true
    void regenerate()
  }, [regenerate])

  const changeVertexCount = (vertices: number) => {
    setVertexCount(vertices)
    void regenerate(vertices)
  }

  const solve = async () => {
    solver.reset()
    setFallbackError('')
    setResult(null)
    try {
      setResult(
        await solver.mutateAsync({
          vertices: graph.vertices,
          edges: graph.edges,
          trials,
        }),
      )
    } catch {
      try {
        setResult(solveMinCutLocally(graph.vertices, graph.edges, trials))
        solver.reset()
      } catch (reason) {
        setFallbackError(formatError(reason))
      }
    }
  }

  return (
    <div className="lab-page graph-lab">
      <LabHeader
        eyebrow="randomized graph · minimum cut"
        title="The minimum cut problem"
        description="Find the smallest set of edges whose removal separates a graph. Karger’s contractions make the hidden split visible."
        badge="Probabilistic result"
      />
      <ConceptExplainer
        problem="A cut divides a connected graph into two non-empty groups. Its size is the number of edges that cross between them. The minimum-cut problem asks for the division with the fewest crossing edges—the graph’s weakest connection or bottleneck."
        algorithmName="Karger’s algorithm"
        algorithm="Karger’s algorithm repeatedly picks a random edge and merges its two endpoints, discarding self-loops along the way. When only two supernodes remain, the edges between them form a cut. Repeating the random experiment makes it increasingly likely that one trial preserves the true minimum cut."
        steps={[
          'Choose an edge uniformly at random.',
          'Contract its endpoints and remove self-loops.',
          'Keep the smallest two-supernode cut across all trials.',
        ]}
      />
      <div className="lab-layout section-wrap">
        <MinCutControls
          vertexCount={vertexCount}
          trials={trials}
          error={error}
          isGenerating={generation.isPending}
          isSolving={solver.isPending}
          onVertexCountChange={changeVertexCount}
          onTrialsChange={setTrials}
          onGenerate={() => void regenerate()}
          onSolve={() => void solve()}
        />
        <MinCutWorkspace graph={graph} result={result} />
        <MinCutMetrics result={result} />
      </div>
      <div className="next-lab section-wrap">
        <span>Try another family</span>
        <Link to="/problems/eight-puzzle">Explore informed search →</Link>
      </div>
    </div>
  )
}
