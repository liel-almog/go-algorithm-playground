import { noop } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { algorithmQueries } from '../features/algorithms/queries'
import { EightPuzzlePage } from '../features/eight-puzzle'
import { LabHeader } from './algorithms.$algorithmId'

export const Route = createFileRoute('/problems/eight-puzzle')({
  loader: ({ context }) => {
    void context.queryClient
      .prefetchQuery(algorithmQueries.catalog())
      .catch(noop)
  },
  component: EightPuzzleRoute,
})

function EightPuzzleRoute() {
  return (
    <div className="lab-page">
      <LabHeader
        eyebrow="state-space search · classic 8-puzzle"
        title="The 8-puzzle problem"
        description="Generate a valid board, solve it yourself, or ask BFS, DFS, or A* to find a route to the goal."
        badge="Interactive puzzle"
      />
      <EightPuzzlePage />
    </div>
  )
}
