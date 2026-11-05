import {
  matrixClaimSchema,
  matrixGenerateRequestSchema,
  matrixRequestSchema,
  matrixResultSchema,
} from '../lib/apiSchemas'
import type { MatrixClaim } from '../lib/apiSchemas'
import { apiInstance, errorHelper, parseResponse } from './index.service'

const PREFIX = 'problems/matrix-verification' as const

export const matrixVerificationService = {
  async generate(size: number) {
    try {
      const data = matrixGenerateRequestSchema.parse({ size })
      const res = await apiInstance.post(`${PREFIX}/generate`, data)
      return parseResponse(matrixClaimSchema, res.data)
    } catch (error) {
      throw errorHelper(error)
    }
  },

  async solve(claim: MatrixClaim, rounds: number) {
    try {
      const data = matrixRequestSchema.parse({ ...claim, rounds })
      const res = await apiInstance.post(`${PREFIX}/solve`, data)
      return parseResponse(matrixResultSchema, res.data)
    } catch (error) {
      throw errorHelper(error)
    }
  },
} as const
