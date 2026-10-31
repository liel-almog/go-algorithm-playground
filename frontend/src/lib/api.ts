export type Algorithm = {
  id: string
  name: string
  description: string
  optimal: boolean
  category: string
}

export type SolveResult = {
  algorithm: string
  path: number[][]
  moves: string[]
  moveCount: number
  expanded: number
  generated: number
  frontierMax: number
  durationUs: number
  optimal: boolean
}

export type Edge = { from: string; to: string }

export type MinCutResult = {
  algorithm: string
  cutSize: number
  partitions: [string[], string[]]
  crossingEdges: Edge[]
  trials: number
  confidence: number
  durationUs: number
}

const apiBase = import.meta.env.VITE_API_BASE_URL ?? ''

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${apiBase}${path}`, options)
  const data: unknown = await response.json().catch(() => ({}))

  if (!response.ok) {
    const message =
      typeof data === 'object' && data !== null && 'error' in data
        ? String(data.error)
        : `Request failed (${response.status})`
    throw new Error(message)
  }

  return data as T
}

const jsonHeaders = { 'Content-Type': 'application/json' }

export const api = {
  algorithms: () => request<{ algorithms: Algorithm[] }>('/api/algorithms'),

  randomPuzzle: (scramble: number) =>
    request<{ size: number; tiles: number[]; scramble: number }>(
      '/api/puzzles/random',
      {
        method: 'POST',
        headers: jsonHeaders,
        body: JSON.stringify({ size: 3, scramble }),
      },
    ),

  solvePuzzle: (tiles: number[], algorithm: string) =>
    request<SolveResult>('/api/solve', {
      method: 'POST',
      headers: jsonHeaders,
      body: JSON.stringify({ size: 3, tiles, algorithm }),
    }),

  minimumCut: (vertices: string[], edges: Edge[], trials: number) =>
    request<MinCutResult>('/api/graphs/min-cut', {
      method: 'POST',
      headers: jsonHeaders,
      body: JSON.stringify({ vertices, edges, trials }),
    }),
}
