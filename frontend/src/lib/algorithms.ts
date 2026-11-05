import type { Algorithm, AlgorithmCatalog } from './apiSchemas'

export type PuzzleAlgorithmId = 'astar' | 'bfs' | 'dfs'
export type PuzzleAlgorithm = Algorithm & { id: PuzzleAlgorithmId }

export const defaultPuzzleAlgorithm: PuzzleAlgorithm = {
  id: 'astar',
  name: 'A* Search',
  description:
    'Balances the path already travelled with a Manhattan-distance estimate of what remains.',
  optimal: true,
  category: 'informed',
}

export const puzzleAlgorithms: PuzzleAlgorithm[] = [
  defaultPuzzleAlgorithm,
  {
    id: 'bfs',
    name: 'Breadth-first search',
    description:
      'Explores the puzzle level by level, guaranteeing the shortest solution at a memory cost.',
    optimal: true,
    category: 'uninformed',
  },
  {
    id: 'dfs',
    name: 'Iterative deepening DFS',
    description:
      'Repeats depth-first search with a growing limit to combine low memory with shortest paths.',
    optimal: true,
    category: 'uninformed',
  },
]

export const fallbackAlgorithmCatalog = {
  algorithms: puzzleAlgorithms,
  tools: [
    {
      id: 'karger',
      name: 'Karger randomized minimum cut',
      category: 'graph',
      endpoint: '/api/problems/minimum-cut/solve',
    },
  ],
} satisfies AlgorithmCatalog

const puzzleAlgorithmIds: ReadonlySet<string> = new Set(
  puzzleAlgorithms.map(({ id }) => id),
)

export function isPuzzleAlgorithm(
  algorithm: Algorithm,
): algorithm is PuzzleAlgorithm {
  return puzzleAlgorithmIds.has(algorithm.id)
}

export function findPuzzleAlgorithm(
  id: string,
  algorithms: readonly PuzzleAlgorithm[] = puzzleAlgorithms,
) {
  return algorithms.find((algorithm) => algorithm.id === id)
}
