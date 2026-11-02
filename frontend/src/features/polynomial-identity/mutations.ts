import { mutationOptions } from '@tanstack/react-query'
import { api } from '../../lib/api'
import type { PolynomialIdentity } from '../../lib/api'
import { problemMutationKeys } from '../problems/mutationKeys'

const problemId = 'polynomial-identity'

export const polynomialIdentityMutations = {
  generate: () =>
    mutationOptions({
      mutationKey: problemMutationKeys.generate(problemId),
      mutationFn: (variables: { degree: number }) =>
        api.randomPolynomial(variables.degree),
    }),
  solve: () =>
    mutationOptions({
      mutationKey: problemMutationKeys.solve(problemId),
      mutationFn: (variables: {
        identity: PolynomialIdentity
        rounds: number
      }) => api.verifyPolynomial(variables.identity, variables.rounds),
    }),
}
