import { mutationOptions } from '@tanstack/react-query'
import { api } from '../../lib/api'
import type { MatrixClaim } from '../../lib/api'
import { problemMutationKeys } from '../problems/mutationKeys'

const problemId = 'matrix-verification'

export const matrixVerificationMutations = {
  generate: () =>
    mutationOptions({
      mutationKey: problemMutationKeys.generate(problemId),
      mutationFn: (variables: { size: number }) =>
        api.randomMatrices(variables.size),
    }),
  solve: () =>
    mutationOptions({
      mutationKey: problemMutationKeys.solve(problemId),
      mutationFn: ({ claim, rounds }: { claim: MatrixClaim; rounds: number }) =>
        api.verifyMatrices(claim, rounds),
    }),
}
