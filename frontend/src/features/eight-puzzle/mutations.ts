import { mutationOptions } from '@tanstack/react-query'
import { eightPuzzleService } from '../../services/eight-puzzle.service'
import { problemMutationKeys } from '../problems/mutationKeys'

const problemId = 'eight-puzzle'

export const puzzleMutations = {
  generate: () =>
    mutationOptions({
      mutationKey: problemMutationKeys.generate(problemId),
      mutationFn: (variables: {
        rows: number
        columns: number
        scramble: number
      }) =>
        eightPuzzleService.generate(
          variables.rows,
          variables.columns,
          variables.scramble,
        ),
    }),
}
