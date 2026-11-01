import { mutationOptions } from '@tanstack/react-query'
import { api } from '../../lib/api'
import type { Edge } from '../../lib/api'
import { problemMutationKeys } from '../problems/mutationKeys'

export const minCutMutations = {
  solve: () =>
    mutationOptions({
      mutationKey: problemMutationKeys.solve('minimum-cut'),
      mutationFn: (variables: {
        vertices: string[]
        edges: Edge[]
        trials: number
      }) =>
        api.minimumCut(variables.vertices, variables.edges, variables.trials),
    }),
}
