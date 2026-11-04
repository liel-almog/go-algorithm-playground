import { queryOptions } from '@tanstack/react-query'
import { api, ApiError } from '../../lib/api'

const fiveMinutes = 5 * 60 * 1000

export const algorithmQueries = {
  all: () => ['algorithms'] as const,
  catalog: () =>
    queryOptions({
      queryKey: algorithmQueries.all(),
      queryFn: ({ signal }) => api.algorithms(signal),
      staleTime: fiveMinutes,
      retry: (failureCount, error) =>
        failureCount < 1 &&
        (!(error instanceof ApiError) || error.status >= 500),
    }),
}
