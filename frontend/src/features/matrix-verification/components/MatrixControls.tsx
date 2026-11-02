import { PanelHeading } from '../../../components/PanelHeading'
import { RangeControl } from '../../../components/RangeControl'

interface MatrixControlsProps {
  size: number
  rounds: number
  tampered: boolean
  isGenerating: boolean
  isVerifying: boolean
  failureProbability: string
  onSizeChange: (size: number) => void
  onRoundsChange: (rounds: number) => void
  onGenerate: () => void
  onToggleTamper: () => void
  onVerify: () => void
}

export function MatrixControls({
  size,
  rounds,
  tampered,
  isGenerating,
  isVerifying,
  failureProbability,
  onSizeChange,
  onRoundsChange,
  onGenerate,
  onToggleTamper,
  onVerify,
}: MatrixControlsProps) {
  const disabled = isGenerating || isVerifying

  return (
    <aside className="control-panel">
      <PanelHeading
        step="01"
        title="Create a claim"
        description="Generate A, B, and their proposed product C."
      />
      <RangeControl
        label="Matrix size"
        value={`${size} × ${size}`}
        inputValue={size}
        min={2}
        max={5}
        disabled={disabled}
        startLabel="2 × 2"
        endLabel="5 × 5"
        onChange={onSizeChange}
      />
      <button
        className="button button-secondary button-full"
        onClick={onGenerate}
        disabled={disabled}
      >
        <span aria-hidden="true">↻</span>{' '}
        {isGenerating ? 'Generating…' : 'Generate matrices'}
      </button>
      <button
        className="text-action"
        onClick={onToggleTamper}
        disabled={disabled}
      >
        {tampered ? 'Restore the correct product' : 'Introduce a hidden error'}
      </button>
      <div className="panel-divider" />
      <PanelHeading
        step="02"
        title="Run the verifier"
        description="More rounds reduce the chance of accepting a false claim."
      />
      <RangeControl
        label="Rounds"
        value={rounds}
        inputValue={rounds}
        min={1}
        max={10}
        disabled={disabled}
        startLabel="Fast"
        endLabel="Stronger"
        onChange={onRoundsChange}
      />
      <button
        className="button button-primary button-full"
        onClick={onVerify}
        disabled={disabled}
      >
        <span aria-hidden="true">▶</span>{' '}
        {isVerifying ? 'Verifying…' : 'Verify A × B = C'}
      </button>
      <div className="request-preview">
        <span>Error bound</span>
        <code>
          Pr[false positive] ≤ 2⁻{rounds} = {failureProbability}
        </code>
      </div>
    </aside>
  )
}
