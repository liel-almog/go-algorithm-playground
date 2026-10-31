export type Algorithm = { id: string; name: string; description: string; optimal: boolean; category: string }
export type SolveResult = {
  algorithm: string; path: number[][]; moves: string[]; moveCount: number; expanded: number
  generated: number; frontierMax: number; durationUs: number; optimal: boolean
}
export type Comparison = { results: SolveResult[]; errors?: Record<string, string>; winner?: string; rule: string }
export type MinCutResult = {
  algorithm: string; cutSize: number; partitions: [string[], string[]]
  crossingEdges: { from: string; to: string }[]; trials: number; confidence: number; durationUs: number
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(path, options)
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(data.error || `Request failed (${response.status})`)
  return data
}

export const api = {
  algorithms: () => request<{ algorithms: Algorithm[] }>('/api/algorithms'),
  randomPuzzle: (scramble: number) => request<{ size: number; tiles: number[] }>('/api/puzzles/random', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ size: 3, scramble }),
  }),
  solve: (tiles: number[], algorithm: string) => request<SolveResult>('/api/solve', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ size: 3, tiles, algorithm }),
  }),
  compare: (tiles: number[], algorithms: string[]) => request<Comparison>('/api/compare', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ size: 3, tiles, algorithms }),
  }),
  minCut: (vertices: string[], edges: { from: string; to: string }[], trials: number) => request<MinCutResult>('/api/graphs/min-cut', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ vertices, edges, trials }),
  }),
}
