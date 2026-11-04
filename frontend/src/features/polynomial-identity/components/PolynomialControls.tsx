import { CodePreview } from '../../../components/CodePreview'
import { ControlPanel, PanelDivider } from '../../../components/LabPanels'
import { PanelHeading } from '../../../components/PanelHeading'
import { RangeControl } from '../../../components/RangeControl'
import { Button } from '../../../components/ui/button'

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
    <ControlPanel>
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
      <Button
        variant="secondary"
        className="min-h-[43px] w-full text-xs"
        onClick={onGenerate}
        disabled={disabled}
      >
        <span aria-hidden="true">↻</span>{' '}
        {isGenerating ? 'Generating…' : 'Generate identity'}
      </Button>
      <Button
        variant="ghost"
        className="mt-[9px] w-full text-xs text-orange"
        onClick={onAlter}
        disabled={disabled}
      >
        Change one random coefficient
      </Button>
      <PanelDivider />
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
      <Button
        className="min-h-[43px] w-full text-xs"
        onClick={onVerify}
        disabled={disabled}
      >
        <span aria-hidden="true">▶</span>{' '}
        {isVerifying ? 'Verifying…' : 'Verify identity'}
      </Button>
      <CodePreview label="Method">
        Choose r ∈ 𝔽₁₀₁
        <br />
        Compare P(r) and Q(r)
      </CodePreview>
    </ControlPanel>
  )
}
