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
      mutationFn: async ({
        claim,
        rounds,
      }: {
        claim: MatrixClaim
        rounds: number
      }) => {
        if (!Number.isInteger(rounds) || rounds < 1 || rounds > 15) {
          throw new Error('Choose between 1 and 15 verification tries.')
        }
        if (rounds <= 10) return api.verifyMatrices(claim, rounds)

        const [first, second] = await Promise.all([
          api.verifyMatrices(claim, 10),
          api.verifyMatrices(claim, rounds - 10),
        ])
        return {
          ...first,
          accepted: first.accepted && second.accepted,
          trials: [...first.trials, ...second.trials],
          falsePositiveBound: 2 ** -rounds,
        }
      },
    }),
}
