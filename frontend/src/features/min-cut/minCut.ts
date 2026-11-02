import type { Edge } from '../../lib/api'

export type GraphProblem = { vertices: string[]; edges: Edge[] }

export function generateLocalGraph(count: number): GraphProblem {
  if (!Number.isInteger(count) || count < 3) {
    throw new Error('Graph generation requires at least three vertices.')
  }
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
    const from = vertices[index]
    const next = vertices[(index + 1) % count]
    const following = vertices[(index + 2) % count]
    if (from === undefined || next === undefined || following === undefined) {
      throw new Error('Could not generate the requested graph.')
    }
    addEdge(from, next)
    addEdge(from, following)
  }
  const extras = Math.max(1, Math.floor(count / 3))
  for (let index = 0; index < extras; index += 1) {
    const from = vertices[Math.floor(Math.random() * count)]
    const to = vertices[Math.floor(Math.random() * count)]
    if (from === undefined || to === undefined) continue
    addEdge(from, to)
  }
  return { vertices, edges }
}

export function formatGraphTime(microseconds: number) {
  return microseconds < 1000
    ? `${microseconds} μs`
    : `${(microseconds / 1000).toFixed(1)} ms`
}

export function formatError(reason: unknown) {
  if (!reason) return ''
  return reason instanceof Error ? reason.message : 'The request failed.'
}
