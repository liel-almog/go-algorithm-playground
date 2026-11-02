import { PanelHeading } from '../../../components/PanelHeading'
import { RangeControl } from '../../../components/RangeControl'

interface MinCutControlsProps {
  vertexCount: number
  trials: number
  error: string
  isGenerating: boolean
  isSolving: boolean
  onVertexCountChange: (count: number) => void
  onTrialsChange: (trials: number) => void
  onGenerate: () => void
  onSolve: () => void
}

export function MinCutControls({
  vertexCount,
  trials,
  error,
  isGenerating,
  isSolving,
  onVertexCountChange,
  onTrialsChange,
  onGenerate,
  onSolve,
}: MinCutControlsProps) {
  const disabled = isGenerating || isSolving

  return (
    <aside className="control-panel">
      <PanelHeading
        step="01"
        title="Generate a problem"
        description="Build a connected graph with a hidden bottleneck."
      />
      <RangeControl
        label="Vertices"
        value={vertexCount}
        inputValue={vertexCount}
        min={5}
        max={10}
        disabled={disabled}
        startLabel="5"
        endLabel="10"
        onChange={onVertexCountChange}
      />
      <button
        className="button button-secondary button-full"
        onClick={onGenerate}
        disabled={disabled}
      >
        <span aria-hidden="true">↻</span>{' '}
        {isGenerating ? 'Generating…' : 'Generate new graph'}
      </button>
      <div className="panel-divider" />
      <PanelHeading
        step="02"
        title="Ask the backend"
        description="Repeat random contractions and keep the smallest cut."
      />
      <RangeControl
        label="Trials"
        value={trials}
        inputValue={trials}
        min={10}
        max={250}
        step={10}
        disabled={disabled}
        startLabel="Quick"
        endLabel="Confident"
        onChange={onTrialsChange}
      />
      <button
        className="button button-primary button-full"
        onClick={onSolve}
        disabled={disabled}
      >
        {isSolving ? (
          <span className="spinner" />
        ) : (
          <span aria-hidden="true">▶</span>
        )}
        {isSolving ? 'Contracting…' : 'Find minimum cut'}
      </button>
      {error && (
        <div className="error-message" role="alert">
          <strong>Couldn’t calculate the cut</strong>
          <span>{error}</span>
        </div>
      )}
      <div className="request-preview">
        <span>Request</span>
        <code>
          POST /api/problems/minimum-cut/solve · local fallback
          <br />
          trials: {trials}
        </code>
      </div>
    </aside>
  )
}
