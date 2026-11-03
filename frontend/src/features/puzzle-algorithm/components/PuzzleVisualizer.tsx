import labStyles from '../../../components/lab.module.css'
import puzzleStyles from '../../../components/puzzle.module.css'
import { PlaybackButton } from '../../../components/PlaybackButton'
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
  const nextMove = result?.moves[step]
  const finalStep = result ? result.path.length - 1 : 0

  return (
    <section className={labStyles['visualizer-panel']}>
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
      <div className={puzzleStyles['puzzle-stage']}>
        {visibleTiles.length > 0 ? (
          <PuzzleBoard tiles={visibleTiles} move={currentMove} />
        ) : (
          <div
            className={puzzleStyles['board-skeleton']}
            aria-label="Loading puzzle"
          />
        )}
        <div className={puzzleStyles['goal-key']}>
          <span /> Goal: arrange 1–8 with the empty space last
        </div>
      </div>
      <div className={puzzleStyles['playback-bar']}>
        <PlaybackButton
          aria-label="Previous step"
          onClick={() => {
            onPlayingChange(false)
            onStepChange(Math.max(0, step - 1))
          }}
          disabled={!result || step === 0}
        >
          ←
        </PlaybackButton>
        <PlaybackButton
          primary
          aria-label={isPlaying ? 'Pause animation' : 'Play animation'}
          onClick={() => {
            if (result && step === finalStep) onStepChange(0)
            onPlayingChange(!isPlaying)
          }}
          disabled={!result}
        >
          {isPlaying ? 'Ⅱ' : '▶'}
        </PlaybackButton>
        <PlaybackButton
          aria-label="Next step"
          onClick={() => {
            onPlayingChange(false)
            onStepChange(Math.min(finalStep, step + 1))
          }}
          disabled={!result || step === finalStep}
        >
          →
        </PlaybackButton>
        <div className={puzzleStyles['progress-track']}>
          <span
            style={{
              width: result
                ? `${(step / Math.max(1, finalStep)) * 100}%`
                : '0%',
            }}
          />
        </div>
        <span className={puzzleStyles['move-label']}>
          {nextMove ? `next: ${nextMove}` : result ? 'complete' : 'waiting'}
        </span>
      </div>
    </section>
  )
}
