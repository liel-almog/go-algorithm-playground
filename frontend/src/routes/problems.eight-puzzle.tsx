import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useMemo, useRef, useState } from 'react'
import { ConceptExplainer } from '../components/ConceptExplainer'
import {
  generateLocalPuzzle,
  solvePuzzleLocally,
} from '../lib/clientAlgorithms'
import { findPuzzleAlgorithm, puzzleAlgorithms } from '../lib/algorithms'
import { api } from '../lib/api'
import type { SolveResult } from '../lib/api'
import { LabHeader } from './algorithms.$algorithmId'

export const Route = createFileRoute('/problems/eight-puzzle')({
  component: EightPuzzlePage,
})

const goal = [1, 2, 3, 4, 5, 6, 7, 8, 0]

function EightPuzzlePage() {
  const [algorithmId, setAlgorithmId] = useState('astar')
  const algorithm = findPuzzleAlgorithm(algorithmId) ?? puzzleAlgorithms[0]
  const [tiles, setTiles] = useState<number[]>([])
  const [initialTiles, setInitialTiles] = useState<number[]>([])
  const [scramble, setScramble] = useState(18)
  const [playerMoves, setPlayerMoves] = useState(0)
  const [result, setResult] = useState<SolveResult | null>(null)
  const [step, setStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSolving, setIsSolving] = useState(false)
  const [generationSource, setGenerationSource] = useState<
    'backend' | 'local' | null
  >(null)
  const [error, setError] = useState('')
  const didGenerate = useRef(false)

  const setNewPuzzle = (nextTiles: number[]) => {
    setTiles(nextTiles)
    setInitialTiles(nextTiles)
    setPlayerMoves(0)
    setResult(null)
    setStep(0)
    setIsPlaying(false)
  }

  const generateProblem = async () => {
    setIsGenerating(true)
    setError('')
    try {
      const puzzle = await api.randomPuzzle(scramble)
      if (!isValidPuzzle(puzzle.tiles)) {
        throw new Error('The generator returned an invalid board.')
      }
      setNewPuzzle(puzzle.tiles)
      setGenerationSource('backend')
    } catch {
      setNewPuzzle(generateLocalPuzzle(scramble))
      setGenerationSource('local')
    } finally {
      setIsGenerating(false)
    }
  }

  useEffect(() => {
    if (didGenerate.current) return
    didGenerate.current = true
    void generateProblem()
  }, [])

  useEffect(() => {
    if (!isPlaying || !result) return
    if (step >= result.path.length - 1) {
      setIsPlaying(false)
      return
    }
    const timer = window.setTimeout(
      () => setStep((current) => current + 1),
      650,
    )
    return () => window.clearTimeout(timer)
  }, [isPlaying, result, step])

  const runAlgorithm = async () => {
    if (tiles.length === 0) return
    setIsSolving(true)
    setError('')
    setResult(null)
    setStep(0)
    setIsPlaying(false)
    try {
      setResult(await api.solvePuzzle(tiles, algorithm.id))
    } catch (reason) {
      if (algorithm.id === 'astar') {
        try {
          setResult(solvePuzzleLocally(tiles))
        } catch (fallbackReason) {
          setError(errorMessage(fallbackReason))
        }
      } else {
        setError(errorMessage(reason))
      }
    } finally {
      setIsSolving(false)
    }
  }

  const moveTile = (index: number) => {
    if (isGenerating || isSolving || result) return
    const empty = tiles.indexOf(0)
    if (!areAdjacent(index, empty)) return
    const next = [...tiles]
    ;[next[index], next[empty]] = [next[empty], next[index]]
    setTiles(next)
    setPlayerMoves((current) => current + 1)
    setError('')
  }

  const resetBoard = () => {
    setTiles(initialTiles)
    setPlayerMoves(0)
    setResult(null)
    setStep(0)
    setIsPlaying(false)
    setError('')
  }

  const visibleTiles = result?.path[step] ?? tiles
  const currentMove = step > 0 ? result?.moves[step - 1] : undefined
  const explanation = puzzleExplanations[algorithm.id]
  const playerSolved =
    tiles.length === 9 && tiles.every((tile, i) => tile === goal[i])

  return (
    <div className="lab-page">
      <LabHeader
        eyebrow="state-space search · classic 8-puzzle"
        title="The 8-puzzle problem"
        description="Generate a valid board, solve it yourself, or ask BFS, DFS, or A* to find a route to the goal."
        badge="Interactive puzzle"
      />

      <ConceptExplainer
        problem="The 8-puzzle has eight numbered tiles and one empty space on a 3 × 3 board. Click a tile beside the gap to slide it. The goal is to arrange the tiles from 1 through 8 with the empty space last."
        algorithmName={algorithm.name}
        algorithm={explanation.algorithm}
        steps={explanation.steps}
      />

      <div className="lab-layout section-wrap">
        <aside className="control-panel">
          <div className="panel-heading">
            <span>01</span>
            <div>
              <strong>Generate a problem</strong>
              <p>Every generated board is solvable.</p>
            </div>
          </div>

          <label className="range-control">
            <span>
              Scramble depth <strong>{scramble}</strong>
            </span>
            <input
              type="range"
              min="4"
              max="36"
              value={scramble}
              onChange={(event) => setScramble(Number(event.target.value))}
            />
            <small>
              <span>Gentle</span>
              <span>Deeper</span>
            </small>
          </label>

          <button
            className="button button-secondary button-full"
            onClick={() => void generateProblem()}
            disabled={isGenerating || isSolving}
          >
            <span aria-hidden="true">↻</span>
            {isGenerating ? 'Generating…' : 'Generate new puzzle'}
          </button>

          <div className="panel-divider" />

          <div className="panel-heading">
            <span>02</span>
            <div>
              <strong>Choose a solver</strong>
              <p>Run one backend algorithm on the current board.</p>
            </div>
          </div>

          <label className="select-control">
            <span>Algorithm</span>
            <select
              value={algorithmId}
              onChange={(event) => {
                setAlgorithmId(event.target.value)
                setResult(null)
                setStep(0)
                setIsPlaying(false)
                setError('')
              }}
              disabled={isSolving}
            >
              {puzzleAlgorithms.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.id === 'astar' ? 'A*' : option.id.toUpperCase()} —{' '}
                  {option.name}
                </option>
              ))}
            </select>
          </label>

          <button
            className="button button-primary button-full"
            onClick={() => void runAlgorithm()}
            disabled={tiles.length === 0 || isSolving || isGenerating}
          >
            {isSolving ? (
              <span className="spinner" />
            ) : (
              <span aria-hidden="true">▶</span>
            )}
            {isSolving
              ? 'Searching…'
              : `Run ${algorithm.id === 'astar' ? 'A*' : algorithm.id.toUpperCase()}`}
          </button>

          <button
            className="board-reset"
            onClick={resetBoard}
            disabled={initialTiles.length === 0 || isGenerating || isSolving}
          >
            Reset playable board
          </button>

          {error && (
            <div className="error-message" role="alert">
              <strong>Couldn’t reach a solution</strong>
              <span>{error}</span>
            </div>
          )}

          <div className="request-preview">
            <span>Requests</span>
            <code>
              POST /api/problems/eight-puzzle/generate
              <br />
              POST /api/problems/eight-puzzle/solve
              <br />
              algorithm: “{algorithm.id}”
            </code>
          </div>
        </aside>

        <section className="visualizer-panel">
          <div className="visualizer-topbar">
            <div>
              <span className="live-dot" />
              {playerSolved
                ? `Solved by you in ${playerMoves} moves`
                : result
                  ? 'Solution ready'
                  : isGenerating
                    ? 'Building puzzle'
                    : 'Your turn — click a neighboring tile'}
            </div>
            <span>
              {result
                ? `Step ${step} of ${result.path.length - 1}`
                : `${playerMoves} player ${playerMoves === 1 ? 'move' : 'moves'}`}
            </span>
          </div>

          <div
            className={`puzzle-stage${playerSolved ? ' puzzle-stage-solved' : ''}`}
          >
            {visibleTiles.length > 0 ? (
              <PuzzleBoard
                tiles={visibleTiles}
                move={currentMove}
                onTileClick={moveTile}
                playable={!result && !isGenerating && !isSolving}
              />
            ) : (
              <div className="board-skeleton" aria-label="Loading puzzle" />
            )}
            <div className="goal-key">
              <span /> Goal: arrange 1–8 with the empty space last
            </div>
          </div>

          <div className="playback-bar">
            <button
              aria-label="Previous solution step"
              onClick={() => {
                setIsPlaying(false)
                setStep((current) => Math.max(0, current - 1))
              }}
              disabled={!result || step === 0}
            >
              ←
            </button>
            <button
              className="play-button"
              aria-label={isPlaying ? 'Pause solution' : 'Play solution'}
              onClick={() => {
                if (result && step === result.path.length - 1) setStep(0)
                setIsPlaying((current) => !current)
              }}
              disabled={!result}
            >
              {isPlaying ? 'Ⅱ' : '▶'}
            </button>
            <button
              aria-label="Next solution step"
              onClick={() => {
                setIsPlaying(false)
                setStep((current) =>
                  Math.min(result ? result.path.length - 1 : 0, current + 1),
                )
              }}
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

        <ResultMetrics result={result} />
      </div>
    </div>
  )
}

function PuzzleBoard({
  tiles,
  move,
  playable,
  onTileClick,
}: {
  tiles: number[]
  move?: string
  playable: boolean
  onTileClick: (index: number) => void
}) {
  const empty = tiles.indexOf(0)
  return (
    <div
      className={`puzzle-board${playable ? ' puzzle-board-playable' : ''}`}
      aria-label={`Puzzle board${move ? `, last move ${move}` : ''}`}
    >
      {tiles.map((tile, index) => {
        const movable = playable && tile !== 0 && areAdjacent(index, empty)
        return (
          <button
            key={tile}
            type="button"
            className={
              tile === 0
                ? 'tile tile-empty'
                : movable
                  ? 'tile tile-movable'
                  : 'tile'
            }
            onClick={() => onTileClick(index)}
            disabled={!movable}
            aria-label={
              tile === 0
                ? 'Empty space'
                : movable
                  ? `Slide tile ${tile}`
                  : `Tile ${tile}`
            }
          >
            {tile === 0 ? <span className="sr-only">empty</span> : tile}
            {tile !== 0 && <small>{String.fromCharCode(64 + tile)}</small>}
          </button>
        )
      })}
    </div>
  )
}

function ResultMetrics({ result }: { result: SolveResult | null }) {
  const metrics = useMemo(
    () => [
      {
        label: 'Path length',
        value: result?.moveCount ?? '—',
        suffix: 'moves',
      },
      {
        label: 'States explored',
        value: result?.expanded ?? '—',
        suffix: 'nodes',
      },
      {
        label: 'Peak frontier',
        value: result?.frontierMax ?? '—',
        suffix: 'states',
      },
      {
        label: 'Time',
        value: result ? formatDuration(result.durationUs) : '—',
        suffix: result ? '' : 'runtime',
      },
    ],
    [result],
  )

  return (
    <section className="metrics-panel" aria-label="Solution metrics">
      <div className="metrics-heading">
        <div>
          <span>03</span>
          <strong>Inspect the result</strong>
        </div>
        {result && <i>complete</i>}
      </div>
      <div className="metrics-grid">
        {metrics.map((metric) => (
          <div key={metric.label}>
            <span>{metric.label}</span>
            <strong>{metric.value}</strong>
            <small>{metric.suffix}</small>
          </div>
        ))}
      </div>
    </section>
  )
}

const puzzleExplanations: Record<
  string,
  { algorithm: string; steps: [string, string, string] }
> = {
  astar: {
    algorithm:
      'A* ranks every candidate board by moves already made plus a Manhattan-distance estimate of the moves still needed. It expands the most promising total score first while preserving the shortest-path guarantee.',
    steps: [
      'Score the starting board with g + h.',
      'Expand the lowest-scoring board and add its legal moves.',
      'Reach the goal, then reconstruct the path.',
    ],
  },
  bfs: {
    algorithm:
      'Breadth-first search explores every board one move away, then two moves away, and so on. Its first route to the goal is a shortest route, at the cost of a large in-memory frontier.',
    steps: [
      'Place the starting board in a queue.',
      'Visit every unseen neighbor level by level.',
      'Return the first route to the ordered board.',
    ],
  },
  dfs: {
    algorithm:
      'Iterative-deepening DFS searches one route at a time under a depth limit, then raises that limit until it finds the goal. It combines depth-first memory use with a shortest-route result.',
    steps: [
      'Begin with a small depth limit.',
      'Explore one route at a time up to that limit.',
      'Raise the limit until the goal is reached.',
    ],
  },
}

function areAdjacent(first: number, second: number) {
  if (first < 0 || second < 0) return false
  const rowDistance = Math.abs(Math.floor(first / 3) - Math.floor(second / 3))
  const columnDistance = Math.abs((first % 3) - (second % 3))
  return rowDistance + columnDistance === 1
}

function isValidPuzzle(tiles: number[]) {
  return (
    tiles.length === 9 &&
    new Set(tiles).size === 9 &&
    tiles.every((tile) => Number.isInteger(tile) && tile >= 0 && tile <= 8)
  )
}

function formatDuration(microseconds: number) {
  if (microseconds < 1000) return `${microseconds} μs`
  if (microseconds < 1_000_000) return `${(microseconds / 1000).toFixed(1)} ms`
  return `${(microseconds / 1_000_000).toFixed(2)} s`
}

function errorMessage(reason: unknown) {
  return reason instanceof Error
    ? reason.message
    : 'The backend did not respond.'
}
