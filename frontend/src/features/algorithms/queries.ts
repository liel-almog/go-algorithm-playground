import { queryOptions } from '@tanstack/react-query'
import { algorithmService } from '../../services/algorithm.service'
import { ApiError } from '../../services/index.service'

const fiveMinutes = 5 * 60 * 1000

export const algorithmQueries = {
  all: () => ['algorithms'] as const,
  catalog: () =>
    queryOptions({
      queryKey: algorithmQueries.all(),
      queryFn: ({ signal }) => algorithmService.all(signal),
      staleTime: fiveMinutes,
      retry: (failureCount, error) =>
        failureCount < 1 &&
        (!(error instanceof ApiError) || error.status >= 500),
    }),
}
