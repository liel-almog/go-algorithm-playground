import { PanelHeading } from '../../../components/PanelHeading'
import { RangeControl } from '../../../components/RangeControl'
import type { Algorithm } from '../../../lib/api'

interface PuzzleControlsProps {
  algorithm: Algorithm
  scramble: number
  error: string
  isGenerating: boolean
  isSolving: boolean
  canSolve: boolean
  onScrambleChange: (scramble: number) => void
  onGenerate: () => void
  onSolve: () => void
}

export function PuzzleControls({
  algorithm,
  scramble,
  error,
  isGenerating,
  isSolving,
  canSolve,
  onScrambleChange,
  onGenerate,
  onSolve,
}: PuzzleControlsProps) {
  return (
    <aside className="control-panel">
      <PanelHeading
        step="01"
        title="Generate a problem"
        description="Start with a solvable, shuffled 8-puzzle."
      />
      <RangeControl
        label="Scramble depth"
        value={scramble}
        inputValue={scramble}
        min={4}
        max={36}
        startLabel="Gentle"
        endLabel="Deeper"
        onChange={onScrambleChange}
      />
      <button
        className="button button-secondary button-full"
        onClick={onGenerate}
        disabled={isGenerating || isSolving}
      >
        <span aria-hidden="true">↻</span>
        {isGenerating ? 'Generating…' : 'Generate new puzzle'}
      </button>
      <div className="panel-divider" />
      <PanelHeading
        step="02"
        title="Ask the backend"
        description={<>Run {algorithm.name} against this exact board.</>}
      />
      <button
        className="button button-primary button-full"
        onClick={onSolve}
        disabled={!canSolve || isSolving || isGenerating}
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
          POST /api/problems/eight-puzzle/solve · local fallback
          <br />
          algorithm: “{algorithm.id}”
        </code>
      </div>
    </aside>
  )
}
