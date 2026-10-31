import type { Algorithm } from './api'

export const puzzleAlgorithms: Algorithm[] = [
  {
    id: 'astar',
    name: 'A* Search',
    description:
      'Balances the path already travelled with a Manhattan-distance estimate of what remains.',
    optimal: true,
    category: 'informed',
  },
  {
    id: 'bfs',
    name: 'Breadth-first search',
    description:
      'Explores the puzzle level by level, guaranteeing the shortest solution at a memory cost.',
    optimal: true,
    category: 'uninformed',
  },
  {
    id: 'greedy',
    name: 'Greedy best-first',
    description:
      'Chases the board that looks closest to solved, trading guarantees for speed.',
    optimal: false,
    category: 'informed',
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

export const kargerAlgorithm: Algorithm = {
  id: 'karger',
  name: "Karger's minimum cut",
  description:
    'Repeatedly contracts random edges to reveal a small set of edges that separates a graph.',
  optimal: false,
  category: 'randomized graph',
}

export function findPuzzleAlgorithm(id: string) {
  return puzzleAlgorithms.find((algorithm) => algorithm.id === id)
}
