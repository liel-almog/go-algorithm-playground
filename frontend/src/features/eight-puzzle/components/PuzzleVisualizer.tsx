import labStyles from '../../../components/lab.module.css'
import puzzleStyles from '../../../components/puzzle.module.css'
import { PlaybackButton } from '../../../components/PlaybackButton'
import type { SolveResult } from '../../../lib/api'
import { VisualizerTopbar } from '../../../components/VisualizerTopbar'
import styles from '../eightPuzzle.module.css'
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
  onPrevious,
  onTogglePlayback,
  onNext,
}: PuzzleVisualizerProps) {
  return (
    <section className={labStyles['visualizer-panel']}>
      <VisualizerTopbar
        status={
          playerSolved
            ? `Solved by you in ${playerMoves} moves`
            : result
              ? 'Solution ready'
              : isGenerating
                ? 'Building puzzle'
                : 'Your turn — click a neighboring tile'
        }
        detail={
          result
            ? `Step ${step} of ${result.path.length - 1}`
            : `${playerMoves} player ${playerMoves === 1 ? 'move' : 'moves'}`
        }
      />

      <div
        className={`${puzzleStyles['puzzle-stage']}${playerSolved ? ` ${styles.solved}` : ''}`}
      >
        {tiles.length > 0 ? (
          <PuzzleBoard
            tiles={tiles}
            rows={rows}
            columns={columns}
            move={currentMove}
            onTileClick={onTileClick}
            playable={isInteractive}
          />
        ) : (
          <div
            className={puzzleStyles['board-skeleton']}
            aria-label="Loading puzzle"
          />
        )}
        <div className={puzzleStyles['goal-key']}>
          <span /> Goal: arrange 1–{rows * columns - 1} with the empty space
          last
        </div>
      </div>

      <div className={puzzleStyles['playback-bar']}>
        <PlaybackButton
          aria-label="Previous solution step"
          onClick={onPrevious}
          disabled={!result || step === 0}
        >
          ←
        </PlaybackButton>
        <PlaybackButton
          primary
          aria-label={isPlaying ? 'Pause solution' : 'Play solution'}
          onClick={onTogglePlayback}
          disabled={!result}
        >
          {isPlaying ? 'Ⅱ' : '▶'}
        </PlaybackButton>
        <PlaybackButton
          aria-label="Next solution step"
          onClick={onNext}
          disabled={!result || step === result.path.length - 1}
        >
          →
        </PlaybackButton>
        <div className={puzzleStyles['progress-track']}>
          <span
            style={{
              width: result
                ? `${(step / Math.max(1, result.path.length - 1)) * 100}%`
                : '0%',
            }}
          />
        </div>
        <span className={puzzleStyles['move-label']}>
          {result
            ? result.moves[step]
              ? `next: ${result.moves[step]}`
              : 'complete'
            : generationSource === 'local'
              ? 'local board'
              : 'playable'}
        </span>
      </div>
    </section>
  )
}
