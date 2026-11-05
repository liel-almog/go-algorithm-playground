import { mutationOptions } from '@tanstack/react-query'
import { matrixVerificationService } from '../../services/matrix-verification.service'
import type { MatrixClaim } from '../../lib/apiSchemas'
import { problemMutationKeys } from '../problems/mutationKeys'

const problemId = 'matrix-verification'

export const matrixVerificationMutations = {
  generate: () =>
    mutationOptions({
      mutationKey: problemMutationKeys.generate(problemId),
      mutationFn: (variables: { size: number }) =>
        matrixVerificationService.generate(variables.size),
    }),
  solve: () =>
    mutationOptions({
      mutationKey: problemMutationKeys.solve(problemId),
      mutationFn: ({ claim, rounds }: { claim: MatrixClaim; rounds: number }) =>
        matrixVerificationService.solve(claim, rounds),
    }),
}
