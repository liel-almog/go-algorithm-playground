import type { PuzzleAlgorithmId } from '../../lib/algorithms'

export const puzzleExplanations: Record<
  PuzzleAlgorithmId,
  { algorithm: string; steps: [string, string, string] }
> = {
  astar: {
    algorithm:
      'A* ranks every candidate board by moves already made plus a Manhattan-distance estimate of the moves still needed. It always expands the most promising total score first, so this admissible estimate preserves the shortest-path guarantee.',
    steps: [
      'Score the starting board with g + h.',
      'Expand the lowest-scoring board and add its legal moves.',
      'Reach the goal, then follow parent links back to the start.',
    ],
  },
  bfs: {
    algorithm:
      'Breadth-first search explores all boards one move away, then two moves away, and so on. The first time it reaches the goal must therefore be through a shortest sequence, although storing every frontier can use a lot of memory.',
    steps: [
      'Place the starting board in a queue.',
      'Visit every unseen neighbor level by level.',
      'Return the first path that reaches the ordered board.',
    ],
  },
  dfs: {
    algorithm:
      'Iterative deepening repeatedly runs depth-first search with limits of 0, 1, 2 moves and upward. It gets the low memory use of depth-first search while finding the shallowest—and therefore shortest—solution.',
    steps: [
      'Set an initial depth limit.',
      'Search one path at a time without crossing that limit.',
      'Increase the limit until the goal is found.',
    ],
  },
}
