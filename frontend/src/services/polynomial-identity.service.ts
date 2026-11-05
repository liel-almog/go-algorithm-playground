import {
  polynomialGenerateRequestSchema,
  polynomialIdentitySchema,
  polynomialRequestSchema,
  polynomialResultSchema,
} from '../lib/apiSchemas'
import type { PolynomialIdentity } from '../lib/apiSchemas'
import { apiInstance, errorHelper, parseResponse } from './index.service'

const PREFIX = 'problems/polynomial-identity' as const

export const polynomialIdentityService = {
  async generate(degree: number) {
    try {
      const data = polynomialGenerateRequestSchema.parse({ degree })
      const res = await apiInstance.post(`${PREFIX}/generate`, data)
      return parseResponse(polynomialIdentitySchema, res.data)
    } catch (error) {
      throw errorHelper(error)
    }
  },

  async solve(identity: PolynomialIdentity, rounds: number) {
    try {
      const data = polynomialRequestSchema.parse({ ...identity, rounds })
      const res = await apiInstance.post(`${PREFIX}/solve`, data)
      return parseResponse(polynomialResultSchema, res.data)
    } catch (error) {
      throw errorHelper(error)
    }
  },
} as const
