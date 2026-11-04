import { queryOptions } from '@tanstack/react-query'
import type { PuzzleAlgorithmId } from '../../lib/algorithms'
import { api } from '../../lib/api'

export const puzzleQueries = {
  solve: (
    rows: number,
    columns: number,
    tiles: number[],
    algorithm: PuzzleAlgorithmId,
  ) =>
    queryOptions({
      queryKey: [
        'problems',
        'eight-puzzle',
        'solve',
        rows,
        columns,
        tiles,
        algorithm,
      ],
      queryFn: ({ signal }) =>
        api.solvePuzzle(rows, columns, tiles, algorithm, signal),
      retry: false,
      staleTime: 'static',
      gcTime: 5 * 60 * 1000,
    }),
}
