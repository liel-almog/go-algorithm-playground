import { VisualizerTopbar } from '../../../components/VisualizerTopbar'
import type { SolveResult } from '../../../lib/api'
import { PuzzleBoard } from './PuzzleBoard'

interface PuzzleVisualizerProps {
  tiles: number[]
  result: SolveResult | null
  step: number
  isPlaying: boolean
  isGenerating: boolean
  onStepChange: (step: number) => void
  onPlayingChange: (playing: boolean) => void
}

export function PuzzleVisualizer({
  tiles,
  result,
  step,
  isPlaying,
  isGenerating,
  onStepChange,
  onPlayingChange,
}: PuzzleVisualizerProps) {
  const visibleTiles = result?.path[step] ?? tiles
  const currentMove = step > 0 ? result?.moves[step - 1] : undefined
  const finalStep = result ? result.path.length - 1 : 0

  return (
    <section className="visualizer-panel">
      <VisualizerTopbar
        status={
          result
            ? 'Solution ready'
            : isGenerating
              ? 'Building puzzle'
              : 'Problem ready'
        }
        detail={result ? `Step ${step} of ${finalStep}` : 'Initial state'}
      />
      <div className="puzzle-stage">
        {visibleTiles.length > 0 ? (
          <PuzzleBoard tiles={visibleTiles} move={currentMove} />
        ) : (
          <div className="board-skeleton" aria-label="Loading puzzle" />
        )}
        <div className="goal-key">
          <span /> Goal: arrange 1–8 with the empty space last
        </div>
      </div>
      <div className="playback-bar">
        <button
          aria-label="Previous step"
          onClick={() => {
            onPlayingChange(false)
            onStepChange(Math.max(0, step - 1))
          }}
          disabled={!result || step === 0}
        >
          ←
        </button>
        <button
          className="play-button"
          aria-label={isPlaying ? 'Pause animation' : 'Play animation'}
          onClick={() => {
            if (result && step === finalStep) onStepChange(0)
            onPlayingChange(!isPlaying)
          }}
          disabled={!result}
        >
          {isPlaying ? 'Ⅱ' : '▶'}
        </button>
        <button
          aria-label="Next step"
          onClick={() => {
            onPlayingChange(false)
            onStepChange(Math.min(finalStep, step + 1))
          }}
          disabled={!result || step === finalStep}
        >
          →
        </button>
        <div className="progress-track">
          <span
            style={{
              width: result
                ? `${(step / Math.max(1, finalStep)) * 100}%`
                : '0%',
            }}
          />
        </div>
        <span className="move-label">
          {currentMove ? `move ${currentMove}` : result ? 'start' : 'waiting'}
        </span>
      </div>
    </section>
  )
}
