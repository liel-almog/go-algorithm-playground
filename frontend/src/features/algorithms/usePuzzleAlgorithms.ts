import { useQuery } from '@tanstack/react-query'
import {
  fallbackAlgorithmCatalog,
  isPuzzleAlgorithm,
  puzzleAlgorithms,
} from '../../lib/algorithms'
import type { AlgorithmCatalog } from '../../lib/api'
import { algorithmQueries } from './queries'

function selectPuzzleAlgorithms(catalog: AlgorithmCatalog) {
  const algorithms = catalog.algorithms.filter(isPuzzleAlgorithm)
  return algorithms.length > 0 ? algorithms : puzzleAlgorithms
}

export function usePuzzleAlgorithms() {
  const { data } = useQuery({
    ...algorithmQueries.catalog(),
    placeholderData: fallbackAlgorithmCatalog,
    select: selectPuzzleAlgorithms,
  })
  return data ?? puzzleAlgorithms
}
