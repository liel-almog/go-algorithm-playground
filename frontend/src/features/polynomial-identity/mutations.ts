import { mutationOptions } from '@tanstack/react-query'
import { polynomialIdentityService } from '../../services/polynomial-identity.service'
import type { PolynomialIdentity } from '../../lib/apiSchemas'
import { problemMutationKeys } from '../problems/mutationKeys'

const problemId = 'polynomial-identity'

export const polynomialIdentityMutations = {
  generate: () =>
    mutationOptions({
      mutationKey: problemMutationKeys.generate(problemId),
      mutationFn: (variables: { degree: number }) =>
        polynomialIdentityService.generate(variables.degree),
    }),
  solve: () =>
    mutationOptions({
      mutationKey: problemMutationKeys.solve(problemId),
      mutationFn: (variables: {
        identity: PolynomialIdentity
        rounds: number
      }) =>
        polynomialIdentityService.solve(variables.identity, variables.rounds),
    }),
}
