import type { PuzzleAlgorithmId } from '../../lib/algorithms'

type PuzzleExplanation = {
  algorithm: string
  steps: [string, string, string]
}

export const puzzleExplanations: Record<PuzzleAlgorithmId, PuzzleExplanation> =
  {
    astar: {
      algorithm:
        'A* ranks every candidate board by moves already made plus a Manhattan-distance estimate of the moves still needed. It expands the most promising total score first while preserving the shortest-path guarantee.',
      steps: [
        'Score the starting board with g + h.',
        'Expand the lowest-scoring board and add its legal moves.',
        'Reach the goal, then reconstruct the path.',
      ],
    },
    bfs: {
      algorithm:
        'Breadth-first search explores every board one move away, then two moves away, and so on. Its first route to the goal is a shortest route, at the cost of a large in-memory frontier.',
      steps: [
        'Place the starting board in a queue.',
        'Visit every unseen neighbor level by level.',
        'Return the first route to the ordered board.',
      ],
    },
    dfs: {
      algorithm:
        'Iterative-deepening DFS searches one route at a time under a depth limit, then raises that limit until it finds the goal. It combines depth-first memory use with a shortest-route result.',
      steps: [
        'Begin with a small depth limit.',
        'Explore one route at a time up to that limit.',
        'Raise the limit until the goal is reached.',
      ],
    },
  }
