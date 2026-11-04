import { useMutation, useQueryClient } from '@tanstack/react-query'
import { puzzleQueries } from '../queries'
import { problemMutationKeys } from '../../problems/mutationKeys'
import type { PuzzleAlgorithmId } from '../../../lib/algorithms'

export function usePuzzleSolution() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationKey: problemMutationKeys.solve('eight-puzzle'),
    mutationFn: ({
      rows,
      columns,
      tiles,
      algorithm,
    }: {
      rows: number
      columns: number
      tiles: number[]
      algorithm: PuzzleAlgorithmId
    }) =>
      queryClient.fetchQuery(
        puzzleQueries.solve(rows, columns, tiles, algorithm),
      ),
    retry: false,
  })
}
