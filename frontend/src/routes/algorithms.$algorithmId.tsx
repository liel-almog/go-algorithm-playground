import { noop } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { algorithmQueries } from '../features/algorithms/queries'
import { PuzzleAlgorithmPage } from '../features/puzzle-algorithm/PuzzleAlgorithmPage'

export const Route = createFileRoute('/algorithms/$algorithmId')({
  loader: ({ context }) => {
    void context.queryClient
      .prefetchQuery(algorithmQueries.catalog())
      .catch(noop)
  },
  component: PuzzleAlgorithmRoute,
})

function PuzzleAlgorithmRoute() {
  const { algorithmId } = Route.useParams()
  return <PuzzleAlgorithmPage algorithmId={algorithmId} />
}
