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
    <section className="visualizer-panel">
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

      <div className={`puzzle-stage${playerSolved ? ` ${styles.solved}` : ''}`}>
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
          <div className="board-skeleton" aria-label="Loading puzzle" />
        )}
        <div className="goal-key">
          <span /> Goal: arrange 1–{rows * columns - 1} with the empty space
          last
        </div>
      </div>

      <div className="playback-bar">
        <button
          aria-label="Previous solution step"
          onClick={onPrevious}
          disabled={!result || step === 0}
        >
          ←
        </button>
        <button
          className="play-button"
          aria-label={isPlaying ? 'Pause solution' : 'Play solution'}
          onClick={onTogglePlayback}
          disabled={!result}
        >
          {isPlaying ? 'Ⅱ' : '▶'}
        </button>
        <button
          aria-label="Next solution step"
          onClick={onNext}
          disabled={!result || step === result.path.length - 1}
        >
          →
        </button>
        <div className="progress-track">
          <span
            style={{
              width: result
                ? `${(step / Math.max(1, result.path.length - 1)) * 100}%`
                : '0%',
            }}
          />
        </div>
        <span className="move-label">
          {currentMove
            ? `move ${currentMove}`
            : result
              ? 'start'
              : generationSource === 'local'
                ? 'local board'
                : 'playable'}
        </span>
      </div>
    </section>
  )
}
