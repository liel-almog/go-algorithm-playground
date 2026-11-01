import { Link, createFileRoute } from '@tanstack/react-router'
import { useEffect, useMemo, useRef, useState } from 'react'
import { api } from '../lib/api'
import type { SolveResult } from '../lib/api'
import { findPuzzleAlgorithm } from '../lib/algorithms'
import { ConceptExplainer } from '../components/ConceptExplainer'
import {
  generateLocalPuzzle,
  solvePuzzleLocally,
} from '../lib/clientAlgorithms'

export const Route = createFileRoute('/algorithms/$algorithmId')({
  component: PuzzleAlgorithmPage,
})

function PuzzleAlgorithmPage() {
  const { algorithmId } = Route.useParams()
  const algorithm = findPuzzleAlgorithm(algorithmId)
  const [tiles, setTiles] = useState<number[]>([])
  const [scramble, setScramble] = useState(18)
  const [result, setResult] = useState<SolveResult | null>(null)
  const [step, setStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSolving, setIsSolving] = useState(false)
  const [error, setError] = useState('')
  const generatedFor = useRef('')

  const generateProblem = async () => {
    setIsGenerating(true)
    setError('')
    setResult(null)
    setStep(0)
    setIsPlaying(false)
    try {
      const puzzle = await api.randomPuzzle(scramble)
      setTiles(puzzle.tiles)
    } catch {
      setTiles(generateLocalPuzzle(scramble))
    } finally {
      setIsGenerating(false)
    }
  }

  useEffect(() => {
    if (algorithm && generatedFor.current !== algorithmId) {
      generatedFor.current = algorithmId
      void generateProblem()
    }
  }, [algorithmId, algorithm])

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
    if (!algorithm || tiles.length === 0) return
    setIsSolving(true)
    setError('')
    setResult(null)
    setStep(0)
    try {
      const solution = await api.solvePuzzle(tiles, algorithm.id)
      setResult(solution)
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

  const visibleTiles = result?.path[step] ?? tiles
  const currentMove = step > 0 ? result?.moves[step - 1] : undefined
  const explanation = algorithm ? puzzleExplanations[algorithm.id] : undefined

  if (!algorithm) {
    return (
      <section className="empty-state section-wrap">
        <span>404</span>
        <h1>That algorithm is not in the lab.</h1>
        <p>The backend may know it, but this visualizer does not—yet.</p>
        <Link to="/" className="button button-primary">
          Back to all algorithms
        </Link>
      </section>
    )
  }

  return (
    <div className="lab-page">
      <LabHeader
        eyebrow="state-space search · classic 8-puzzle"
        title="The 8-puzzle problem"
        description={`Arrange eight sliding tiles using ${algorithm.name}. Generate a valid board, solve it, then replay every move.`}
        badge={
          algorithm.optimal ? 'Shortest path guaranteed' : 'Heuristic first'
        }
      />

      <ConceptExplainer
        problem="The 8-puzzle has eight numbered tiles and one empty space on a 3 × 3 board. A move slides one neighboring tile into the gap. The goal is to reach the ordered board in as few legal moves as possible, without searching every possible arrangement."
        algorithmName={algorithm.name}
        algorithm={
          explanation?.algorithm ??
          'The solver explores legal board arrangements until it reaches the ordered goal state.'
        }
        steps={
          explanation?.steps ?? [
            'Start from the shuffled board.',
            'Explore boards reachable by one legal slide.',
            'Stop at the ordered board and reconstruct the moves.',
          ]
        }
      />

      <div className="lab-layout section-wrap">
        <aside className="control-panel">
          <div className="panel-heading">
            <span>01</span>
            <div>
              <strong>Generate a problem</strong>
              <p>Start with a solvable, shuffled 8-puzzle.</p>
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
              <strong>Ask the backend</strong>
              <p>Run {algorithm.name} against this exact board.</p>
            </div>
          </div>

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
            {isSolving ? 'Searching…' : `Run ${algorithm.name}`}
          </button>

          {error && (
            <div className="error-message" role="alert">
              <strong>Couldn’t reach a solution</strong>
              <span>{error}</span>
            </div>
          )}

          <div className="request-preview">
            <span>Request</span>
            <code>
              POST /api/solve · local fallback
              <br />
              algorithm: “{algorithm.id}”
            </code>
          </div>
        </aside>

        <section className="visualizer-panel">
          <div className="visualizer-topbar">
            <div>
              <span className="live-dot" />
              {result
                ? 'Solution ready'
                : isGenerating
                  ? 'Building puzzle'
                  : 'Problem ready'}
            </div>
            <span>
              {result
                ? `Step ${step} of ${result.path.length - 1}`
                : 'Initial state'}
            </span>
          </div>

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
                setIsPlaying(false)
                setStep((current) => Math.max(0, current - 1))
              }}
              disabled={!result || step === 0}
            >
              ←
            </button>
            <button
              className="play-button"
              aria-label={isPlaying ? 'Pause animation' : 'Play animation'}
              onClick={() => {
                if (result && step === result.path.length - 1) setStep(0)
                setIsPlaying((current) => !current)
              }}
              disabled={!result}
            >
              {isPlaying ? 'Ⅱ' : '▶'}
            </button>
            <button
              aria-label="Next step"
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
                  : 'waiting'}
            </span>
          </div>
        </section>

        <ResultMetrics result={result} />
      </div>
    </div>
  )
}

const puzzleExplanations: Record<
  string,
  { algorithm: string; steps: [string, string, string] }
> = {
  astar: {
    algorithm:
      'A* ranks every candidate board by moves already made plus a Manhattan-distance estimate of the moves still needed. It always expands the most promising total score first, so this admissible estimate preserves the shortest-path guarantee.',
    steps: [
      'Score the starting board with g + h.',
      'Expand the lowest-scoring board and add its legal moves.',
      'Reach the goal, then follow parent links back to the start.',
    ],
  },
  bfs: {
    algorithm:
      'Breadth-first search explores all boards one move away, then two moves away, and so on. The first time it reaches the goal must therefore be through a shortest sequence, although storing every frontier can use a lot of memory.',
    steps: [
      'Place the starting board in a queue.',
      'Visit every unseen neighbor level by level.',
      'Return the first path that reaches the ordered board.',
    ],
  },
  dfs: {
    algorithm:
      'Iterative deepening repeatedly runs depth-first search with limits of 0, 1, 2 moves and upward. It gets the low memory use of depth-first search while finding the shallowest—and therefore shortest—solution.',
    steps: [
      'Set an initial depth limit.',
      'Search one path at a time without crossing that limit.',
      'Increase the limit until the goal is found.',
    ],
  },
}

function LabHeader({
  eyebrow,
  title,
  description,
  badge,
}: {
  eyebrow: string
  title: string
  description: string
  badge: string
}) {
  return (
    <section className="lab-header section-wrap">
      <Link to="/" className="back-link">
        ← All problems
      </Link>
      <div className="lab-title-row">
        <div>
          <span className="kicker">{eyebrow}</span>
          <h1>{title}</h1>
          <p>{description}</p>
        </div>
        <span className="lab-badge">◇ {badge}</span>
      </div>
    </section>
  )
}

export { LabHeader }

function PuzzleBoard({ tiles, move }: { tiles: number[]; move?: string }) {
  return (
    <div
      className="puzzle-board"
      aria-label={`Puzzle board${move ? `, last move ${move}` : ''}`}
    >
      {tiles.map((tile, index) => (
        <div key={tile} className={tile === 0 ? 'tile tile-empty' : 'tile'}>
          {tile === 0 ? <span className="sr-only">empty</span> : tile}
          {tile !== 0 && <small>{String.fromCharCode(64 + tile)}</small>}
        </div>
      ))}
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
