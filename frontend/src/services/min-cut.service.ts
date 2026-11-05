import {
  graphGenerateRequestSchema,
  graphSchema,
  minCutRequestSchema,
  minCutResultSchema,
} from '../lib/apiSchemas'
import type { Edge } from '../lib/apiSchemas'
import { apiInstance, errorHelper, parseResponse } from './index.service'

const PREFIX = 'problems/minimum-cut' as const

export const minCutService = {
  async generate(vertices: number) {
    try {
      const data = graphGenerateRequestSchema.parse({ vertices })
      const res = await apiInstance.post(`${PREFIX}/generate`, data)
      return parseResponse(graphSchema, res.data)
    } catch (error) {
      throw errorHelper(error)
    }
  },

  async solve(vertices: string[], edges: Edge[], trials: number) {
    try {
      const data = minCutRequestSchema.parse({ vertices, edges, trials })
      const res = await apiInstance.post(`${PREFIX}/solve`, data)
      return parseResponse(minCutResultSchema, res.data)
    } catch (error) {
      throw errorHelper(error)
    }
  },
} as const
