import axios from 'axios'
import { queryOptions } from '@tanstack/react-query'
import { algorithmService } from '../../services/algorithm.service'

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
        axios.isAxiosError(error) &&
        (!error.response || error.response.status >= 500),
    }),
}
