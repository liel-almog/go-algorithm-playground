import axios from 'axios'
import { ZodError } from 'zod'
import type { z } from 'zod'

const baseURL = (
  import.meta.env.VITE_API_BASE_URL ??
  'https://api.algorithms.lielalmog.com/api'
).replace(/\/$/, '')

export const apiInstance = axios.create({ baseURL, timeout: 15_000 })

export function errorHelper(error: unknown, uncatchedMessage?: string): Error {
  if (axios.isAxiosError(error)) {
    if (error.response) {
      const data: unknown = error.response.data

      if (
        typeof data === 'object' &&
        data !== null &&
        'error' in data &&
        typeof data.error === 'string'
      ) {
        error.message = data.error
      }
    } else if (!axios.isCancel(error)) {
      error.message =
        error.code === axios.AxiosError.ECONNABORTED ||
        error.code === axios.AxiosError.ETIMEDOUT
          ? 'The request timed out. Please try again.'
          : 'Could not reach the server. Check your connection and try again.'
    }

    return error
  }

  if (error instanceof ZodError) return error

  return new Error(
    uncatchedMessage ||
      (error instanceof Error && error.message) ||
      'An unexpected error occurred. Please try again.',
    { cause: error },
  )
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
