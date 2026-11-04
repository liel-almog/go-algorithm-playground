import { queryOptions } from '@tanstack/react-query'
import { api } from '../../lib/api'

export const puzzleQueries = {
  solve: (rows: number, columns: number, tiles: number[], algorithm: string) =>
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
      queryFn: () => api.solvePuzzle(rows, columns, tiles, algorithm),
      staleTime: 'static',
      gcTime: Infinity,
    }),
}
