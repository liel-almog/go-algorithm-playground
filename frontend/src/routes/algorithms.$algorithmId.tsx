import { createFileRoute, notFound } from '@tanstack/react-router'
import { findPuzzleAlgorithm } from '../lib/algorithms'
import { AlgorithmNotFound } from '../features/puzzle-algorithm/components/AlgorithmNotFound'
import { algorithmQueries } from '../features/algorithms/queries'
import { PuzzleAlgorithmPage } from '../features/puzzle-algorithm/PuzzleAlgorithmPage'

export const Route = createFileRoute('/algorithms/$algorithmId')({
  beforeLoad: ({ params }) => {
    if (!findPuzzleAlgorithm(params.algorithmId)) throw notFound()
  },
  notFoundComponent: AlgorithmNotFound,
  loader: ({ context }) => {
    void context.queryClient.prefetchQuery(algorithmQueries.catalog())
  },
  component: PuzzleAlgorithmRoute,
})

function PuzzleAlgorithmRoute() {
  const { algorithmId } = Route.useParams()
  return <PuzzleAlgorithmPage key={algorithmId} algorithmId={algorithmId} />
}
