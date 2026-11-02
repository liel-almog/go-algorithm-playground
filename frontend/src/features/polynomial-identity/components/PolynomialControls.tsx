import { PanelHeading } from '../../../components/PanelHeading'
import { RangeControl } from '../../../components/RangeControl'

interface PolynomialControlsProps {
  degree: number
  rounds: number
  isGenerating: boolean
  isVerifying: boolean
  onDegreeChange: (degree: number) => void
  onRoundsChange: (rounds: number) => void
  onGenerate: () => void
  onAlter: () => void
  onVerify: () => void
}

export function PolynomialControls({
  degree,
  rounds,
  isGenerating,
  isVerifying,
  onDegreeChange,
  onRoundsChange,
  onGenerate,
  onAlter,
  onVerify,
}: PolynomialControlsProps) {
  const disabled = isGenerating || isVerifying

  return (
    <aside className="control-panel">
      <PanelHeading
        step="01"
        title="Create two polynomials"
        description="Generate a matching pair, then edit or perturb it."
      />
      <RangeControl
        label="Degree"
        value={degree}
        inputValue={degree}
        min={2}
        max={7}
        disabled={disabled}
        startLabel="Quadratic"
        endLabel="Degree 7"
        onChange={onDegreeChange}
      />
      <button
        className="button button-secondary button-full"
        onClick={onGenerate}
        disabled={disabled}
      >
        <span aria-hidden="true">↻</span>{' '}
        {isGenerating ? 'Generating…' : 'Generate identity'}
      </button>
      <button className="text-action" onClick={onAlter} disabled={disabled}>
        Change one random coefficient
      </button>
      <div className="panel-divider" />
      <PanelHeading
        step="02"
        title="Test random points"
        description="Each matching evaluation adds evidence."
      />
      <RangeControl
        label="Rounds"
        value={rounds}
        inputValue={rounds}
        min={1}
        max={8}
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
        {isVerifying ? 'Verifying…' : 'Verify identity'}
      </button>
      <div className="request-preview">
        <span>Method</span>
        <code>
          Choose r ∈ 𝔽₁₀₁
          <br />
          Compare P(r) and Q(r)
        </code>
      </div>
    </aside>
  )
}
