import { ControlPanel, PanelDivider } from '../../../components/LabPanels'
import { VerificationRoundsControl } from './VerificationRoundsControl'
import { ErrorProbabilityNote } from './ErrorProbabilityNote'
import { PanelHeading } from '../../../components/PanelHeading'
import { RangeControl } from '../../../components/RangeControl'
import { Button } from '../../../components/ui/button'

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
    <ControlPanel>
      <PanelHeading
        step="01"
        title="Create a claim"
        description="Generate A, B, and their proposed product C."
      />
      <RangeControl
        label="Matrix size"
        value={`${size} × ${size}`}
        inputValue={size}
        min={1}
        max={10}
        disabled={disabled}
        startLabel="1 × 1"
        endLabel="10 × 10"
        onChange={onSizeChange}
      />
      <Button
        variant="secondary"
        className="min-h-[43px] w-full text-xs"
        onClick={onGenerate}
        disabled={disabled}
      >
        <span aria-hidden="true">↻</span>{' '}
        {isGenerating ? 'Generating…' : 'Generate matrices'}
      </Button>
      <Button
        variant="ghost"
        className="mt-[9px] w-full text-xs text-orange"
        onClick={onToggleTamper}
        disabled={disabled}
      >
        {tampered ? 'Restore the correct claim' : 'Introduce a hidden error'}
      </Button>
      <PanelDivider />
      <PanelHeading
        step="02"
        title="Run the verifier"
        description="More rounds reduce the chance of accepting a false claim."
      />
      <VerificationRoundsControl
        rounds={rounds}
        disabled={disabled}
        onChange={onRoundsChange}
      />
      <Button
        className="min-h-[43px] w-full text-xs"
        onClick={onVerify}
        disabled={disabled}
      >
        <span aria-hidden="true">▶</span>{' '}
        {isVerifying
          ? 'Verifying…'
          : `Verify · ${rounds} ${rounds === 1 ? 'try' : 'tries'}`}
      </Button>
      <div className="mt-6 border-t border-border pt-4">
        <div className="text-xs leading-relaxed text-muted-foreground">
          <ErrorProbabilityNote
            rounds={rounds}
            probability={failureProbability}
          />
        </div>
      </div>
    </ControlPanel>
  )
}
