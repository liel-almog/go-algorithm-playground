import axios from 'axios'
import type { z } from 'zod'

const baseURL = (
  import.meta.env.VITE_API_BASE_URL ??
  'https://api.algorithms.lielalmog.com/api'
).replace(/\/$/, '')

export const apiInstance = axios.create({ baseURL, timeout: 15_000 })

export class ApiError extends Error {
  readonly status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

export function errorHelper(error: unknown): Error {
  if (axios.isAxiosError(error)) {
    if (error.response) {
      const data: unknown = error.response.data
      const status = error.response.status
      const message =
        typeof data === 'object' &&
        data !== null &&
        'error' in data &&
        typeof data.error === 'string'
          ? data.error
          : `Request failed (${status})`
      return new ApiError(message, status)
    }
    if (axios.isCancel(error)) return error
    return new Error(
      error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT'
        ? 'The request timed out. Please try again.'
        : 'Could not reach the server. Check your connection and try again.',
      { cause: error },
    )
  }
  return error instanceof Error ? error : new Error(String(error))
}

export function parseResponse<TSchema extends z.ZodType>(
  schema: TSchema,
  data: unknown,
): z.output<TSchema> {
  const parsed = schema.safeParse(data)
  if (!parsed.success) {
    throw new Error(
      'The server returned an invalid response. Please try again.',
    )
  }
  return parsed.data
}
