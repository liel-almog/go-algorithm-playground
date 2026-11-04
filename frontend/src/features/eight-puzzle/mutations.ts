import { mutationOptions } from '@tanstack/react-query'
import { api } from '../../lib/api'
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
        api.randomPuzzle(variables.rows, variables.columns, variables.scramble),
    }),
}
