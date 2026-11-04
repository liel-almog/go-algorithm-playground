import { createFileRoute } from '@tanstack/react-router'
import { algorithmQueries } from '../features/algorithms/queries'
import { EightPuzzlePage } from '../features/eight-puzzle'
import { LabHeader } from '../components/LabHeader'

export const Route = createFileRoute('/problems/eight-puzzle')({
  loader: ({ context }) => {
    void context.queryClient.prefetchQuery(algorithmQueries.catalog())
  },
  component: EightPuzzleRoute,
})

function EightPuzzleRoute() {
  return (
    <div className="pb-[70px]">
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
