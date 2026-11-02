import type { Algorithm } from '../../../lib/api'
import { PanelHeading } from '../../../components/PanelHeading'
import { RangeControl } from '../../../components/RangeControl'
import styles from '../eightPuzzle.module.css'

interface PuzzleControlsProps {
  algorithm: Algorithm
  algorithms: Algorithm[]
  algorithmId: string
  scramble: number
  rows: number
  columns: number
  hasPuzzle: boolean
  canReset: boolean
  isGenerating: boolean
  isSolving: boolean
  error: string
  onAlgorithmChange: (algorithmId: string) => void
  onScrambleChange: (scramble: number) => void
  onRowsChange: (rows: number) => void
  onColumnsChange: (columns: number) => void
  onGenerate: () => Promise<void>
  onSolve: () => Promise<void>
  onReset: () => void
}

export function PuzzleControls({
  algorithm,
  algorithms,
  algorithmId,
  scramble,
  rows,
  columns,
  hasPuzzle,
  canReset,
  isGenerating,
  isSolving,
  error,
  onAlgorithmChange,
  onScrambleChange,
  onRowsChange,
  onColumnsChange,
  onGenerate,
  onSolve,
  onReset,
}: PuzzleControlsProps) {
  return (
    <aside className="control-panel">
      <PanelHeading
        step="01"
        title="Generate a problem"
        description="Every generated board is solvable."
      />

      <div className={styles.dimensionControls}>
        <label className={styles.selectControl}>
          <span>Rows</span>
          <select
            value={rows}
            onChange={(event) => onRowsChange(Number(event.target.value))}
            disabled={isGenerating || isSolving}
          >
            {[2, 3, 4].map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>
        <label className={styles.selectControl}>
          <span>Columns</span>
          <select
            value={columns}
            onChange={(event) => onColumnsChange(Number(event.target.value))}
            disabled={isGenerating || isSolving}
          >
            {[2, 3, 4].map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>
      </div>

      <RangeControl
        label="Scramble depth"
        value={scramble}
        inputValue={scramble}
        min={4}
        max={36}
        disabled={isGenerating || isSolving}
        startLabel="Gentle"
        endLabel="Deeper"
        onChange={onScrambleChange}
      />

      <button
        className="button button-secondary button-full"
        onClick={() => void onGenerate()}
        disabled={isGenerating || isSolving}
      >
        <span aria-hidden="true">↻</span>
        {isGenerating ? 'Generating…' : 'Generate new puzzle'}
      </button>

      <div className="panel-divider" />

      <PanelHeading
        step="02"
        title="Choose a solver"
        description="Run one backend algorithm on the current board."
      />

      <label className={styles.selectControl}>
        <span>Algorithm</span>
        <select
          value={algorithmId}
          onChange={(event) => onAlgorithmChange(event.target.value)}
          disabled={isSolving}
        >
          {algorithms.map((option) => (
            <option key={option.id} value={option.id}>
              {option.id === 'astar' ? 'A*' : option.id.toUpperCase()} —{' '}
              {option.name}
            </option>
          ))}
        </select>
      </label>

      <button
        className="button button-primary button-full"
        onClick={() => void onSolve()}
        disabled={!hasPuzzle || isSolving || isGenerating}
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
        className={styles.boardReset}
        onClick={onReset}
        disabled={!canReset || isGenerating || isSolving}
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
          row: {rows}, column: {columns}
          <br />
          algorithm: “{algorithm.id}”
        </code>
      </div>
    </aside>
  )
}
