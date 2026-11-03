import labStyles from '../../../components/lab.module.css'
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
    <aside className={labStyles['control-panel']}>
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
      <Button
        variant="secondary"
        className="min-h-[43px] w-full text-[0.72rem]"
        onClick={onGenerate}
        disabled={disabled}
      >
        <span aria-hidden="true">↻</span>{' '}
        {isGenerating ? 'Generating…' : 'Generate matrices'}
      </Button>
      <Button
        variant="ghost"
        className="mt-[9px] w-full text-[0.65rem] text-[var(--orange)]"
        onClick={onToggleTamper}
        disabled={disabled}
      >
        {tampered ? 'Restore the correct product' : 'Introduce a hidden error'}
      </Button>
      <div className={labStyles['panel-divider']} />
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
      <Button
        className="min-h-[43px] w-full text-[0.72rem]"
        onClick={onVerify}
        disabled={disabled}
      >
        <span aria-hidden="true">▶</span>{' '}
        {isVerifying ? 'Verifying…' : 'Verify A × B = C'}
      </Button>
      <div className={labStyles['request-preview']}>
        <span>Error bound</span>
        <code>
          Pr[false positive] ≤ 2⁻{rounds} = {failureProbability}
        </code>
      </div>
    </aside>
  )
}
