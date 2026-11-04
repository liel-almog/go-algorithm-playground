import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import { formatError, generateLocalGraph } from '../minCut'
import { minCutMutations } from '../mutations'

export function useMinCut() {
  const [vertexCount, setVertexCount] = useState(7)
  const [trials, setTrials] = useState(90)
  const [graph, setGraph] = useState(() => generateLocalGraph(7))
  const generation = useMutation(minCutMutations.generate())
  const solver = useMutation(minCutMutations.solve())
  const result = solver.data ?? null
  const error = formatError(generation.error ?? solver.error)

  const generate = () => {
    solver.reset()
    generation.mutate({ vertices: vertexCount }, { onSuccess: setGraph })
  }

  const changeVertexCount = (vertices: number) => {
    setVertexCount(vertices)
    setGraph(generateLocalGraph(vertices))
    generation.reset()
    solver.reset()
  }

  const solve = () => {
    generation.reset()
    solver.mutate({ vertices: graph.vertices, edges: graph.edges, trials })
  }

  const changeTrials = (value: number) => {
    setTrials(value)
    solver.reset()
  }

  return {
    vertexCount,
    trials,
    graph,
    result,
    error,
    isGenerating: generation.isPending,
    isSolving: solver.isPending,
    generate,
    changeVertexCount,
    changeTrials,
    solve,
  }
}
