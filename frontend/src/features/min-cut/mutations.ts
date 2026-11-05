import { mutationOptions } from '@tanstack/react-query'
import { minCutService } from '../../services/min-cut.service'
import type { Edge } from '../../lib/apiSchemas'
import { problemMutationKeys } from '../problems/mutationKeys'

export const minCutMutations = {
  generate: () =>
    mutationOptions({
      mutationKey: problemMutationKeys.generate('minimum-cut'),
      mutationFn: (variables: { vertices: number }) =>
        minCutService.generate(variables.vertices),
    }),
  solve: () =>
    mutationOptions({
      mutationKey: problemMutationKeys.solve('minimum-cut'),
      mutationFn: (variables: {
        vertices: string[]
        edges: Edge[]
        trials: number
      }) =>
        minCutService.solve(
          variables.vertices,
          variables.edges,
          variables.trials,
        ),
    }),
}
