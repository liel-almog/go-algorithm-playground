import { algorithmsResponseSchema } from '../lib/apiSchemas'
import { apiInstance, errorHelper, parseResponse } from './index.service'

const PREFIX = 'algorithms' as const

export const algorithmService = {
  async all(signal?: AbortSignal) {
    try {
      const res = await apiInstance.get(PREFIX, signal ? { signal } : undefined)
      return parseResponse(algorithmsResponseSchema, res.data)
    } catch (error) {
      throw errorHelper(error)
    }
  },
} as const
