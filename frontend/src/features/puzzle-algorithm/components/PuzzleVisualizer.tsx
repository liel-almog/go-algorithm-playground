import { VisualizerPanel } from '../../../components/LabPanels'
import { PuzzleStage, PuzzleSkeleton } from '../../../components/PuzzleStage'
import { PuzzlePlayback } from '../../../components/PuzzlePlayback'
import { VisualizerTopbar } from '../../../components/VisualizerTopbar'
import type { SolveResult } from '../../../lib/api'
import { PuzzleBoard } from './PuzzleBoard'

interface PuzzleVisualizerProps {
  tiles: number[]
  result: SolveResult | null
  step: number
  isPlaying: boolean
  isGenerating: boolean
  onPrevious: () => void
  onNext: () => void
  onTogglePlayback: () => void
}

export function PuzzleVisualizer({
  tiles,
  result,
  step,
  isPlaying,
  isGenerating,
  onPrevious,
  onNext,
  onTogglePlayback,
}: PuzzleVisualizerProps) {
  const visibleTiles = result?.path[step] ?? tiles
  const currentMove = step > 0 ? result?.moves[step - 1] : undefined
  const nextMove = result?.moves[step]
  const finalStep = result ? result.path.length - 1 : 0

  let status = 'Problem ready'
  if (isGenerating) status = 'Building puzzle'
  if (result) status = 'Solution ready'

  let moveLabel = result ? 'complete' : 'waiting'
  if (nextMove) moveLabel = `next: ${nextMove}`

  return (
    <VisualizerPanel>
      <VisualizerTopbar
        status={status}
        detail={result ? `Step ${step} of ${finalStep}` : 'Initial state'}
      />
      <PuzzleStage lastTile={8}>
        {visibleTiles.length > 0 ? (
          <PuzzleBoard tiles={visibleTiles} move={currentMove} />
        ) : (
          <PuzzleSkeleton />
        )}
      </PuzzleStage>
      <PuzzlePlayback
        hasResult={!!result}
        step={step}
        finalStep={finalStep}
        isPlaying={isPlaying}
        moveLabel={moveLabel}
        onPrevious={onPrevious}
        onNext={onNext}
        onTogglePlayback={onTogglePlayback}
      />
    </VisualizerPanel>
  )
}
