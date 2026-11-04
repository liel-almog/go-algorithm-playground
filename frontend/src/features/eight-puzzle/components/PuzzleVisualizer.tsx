import { VisualizerPanel } from '../../../components/LabPanels'
import { PuzzleStage } from '../../../components/PuzzleStage'
import { PuzzlePlayback } from '../../../components/PuzzlePlayback'
import type { SolveResult } from '../../../lib/api'
import { VisualizerTopbar } from '../../../components/VisualizerTopbar'
import { Button } from '../../../components/ui/button'
import { PuzzleBoard } from './PuzzleBoard'

interface PuzzleVisualizerProps {
  tiles: number[]
  rows: number
  columns: number
  currentMove?: string | undefined
  playerMoves: number
  playerSolved: boolean
  result: SolveResult | null
  step: number
  isPlaying: boolean
  isGenerating: boolean
  isInteractive: boolean
  generationSource: 'backend' | 'local' | null
  onTileClick: (index: number) => void
  onReset: () => void
  onPrevious: () => void
  onTogglePlayback: () => void
  onNext: () => void
}

export function PuzzleVisualizer({
  tiles,
  rows,
  columns,
  currentMove,
  playerMoves,
  playerSolved,
  result,
  step,
  isPlaying,
  isGenerating,
  isInteractive,
  generationSource,
  onTileClick,
  onReset,
  onPrevious,
  onTogglePlayback,
  onNext,
}: PuzzleVisualizerProps) {
  let status = 'Your turn — click a neighboring tile'
  if (isGenerating) status = 'Building puzzle'
  if (result) status = 'Solution ready'
  if (playerSolved) status = 'Puzzle complete'

  let moveLabel = generationSource === 'local' ? 'local board' : 'playable'
  if (result) {
    const nextMove = result.moves[step]
    moveLabel = nextMove ? `next: ${nextMove}` : 'complete'
  }
  const finalStep = result ? result.path.length - 1 : 0

  return (
    <VisualizerPanel>
      <VisualizerTopbar
        status={status}
        detail={
          result
            ? `Step ${step} of ${finalStep}`
            : `${playerMoves} player ${playerMoves === 1 ? 'move' : 'moves'}`
        }
      />

      {playerSolved && (
        <div
          role="status"
          className="flex flex-col gap-3 border-b border-emerald-200 bg-emerald-50 px-4 py-4 text-emerald-950 sm:flex-row sm:items-center sm:justify-between sm:px-5"
        >
          <div className="flex items-center gap-3">
            <span
              aria-hidden="true"
              className="grid size-10 shrink-0 place-items-center rounded-full bg-emerald-700 text-lg font-bold text-white"
            >
              ✓
            </span>
            <div>
              <p className="text-base font-semibold">Puzzle solved!</p>
              <p className="text-sm text-emerald-800">
                You finished in {playerMoves}{' '}
                {playerMoves === 1 ? 'move' : 'moves'}.
              </p>
            </div>
          </div>
          <Button
            type="button"
            className="min-h-10 w-full sm:w-auto"
            onClick={onReset}
          >
            Play again
          </Button>
        </div>
      )}

      <PuzzleStage lastTile={rows * columns - 1}>
        <PuzzleBoard
          tiles={tiles}
          rows={rows}
          columns={columns}
          move={currentMove}
          onTileClick={onTileClick}
          playable={isInteractive}
        />
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
