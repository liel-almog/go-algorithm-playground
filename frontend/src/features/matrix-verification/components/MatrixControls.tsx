import { ErrorProbabilityNote } from './ErrorProbabilityNote'
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
        min={1}
        max={10}
        disabled={disabled}
        startLabel="1 × 1"
        endLabel="10 × 10"
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
        {tampered ? 'Restore the correct claim' : 'Introduce a hidden error'}
      </Button>
      <div className={labStyles['panel-divider']} />
      <PanelHeading
        step="02"
        title="Run the verifier"
        description="More rounds reduce the chance of accepting a false claim."
      />
      <div className="mt-6 mb-4">
        <label
          htmlFor="verification-tries"
          className="block text-xs font-medium text-foreground"
        >
          Number of tries
        </label>
        <div className="mt-2 grid grid-cols-[40px_1fr_40px] items-center gap-2 rounded-lg border border-input bg-background p-1">
          <Button
            variant="secondary"
            className="h-10 shadow-none"
            aria-label="Decrease number of tries"
            disabled={disabled || rounds <= 1}
            onClick={() => onRoundsChange(rounds - 1)}
          >
            −
          </Button>
          <input
            id="verification-tries"
            className="h-10 min-w-0 w-full rounded-md bg-transparent px-2 text-center font-mono text-xl text-foreground [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none focus-visible:outline-2 focus-visible:outline-primary disabled:opacity-50"
            type="number"
            inputMode="numeric"
            min={1}
            max={15}
            step={1}
            value={rounds}
            disabled={disabled}
            onFocus={(event) => event.currentTarget.select()}
            onChange={(event) => {
              const value = event.currentTarget.valueAsNumber
              if (Number.isFinite(value)) onRoundsChange(value)
            }}
          />
          <Button
            variant="secondary"
            className="h-10 shadow-none"
            aria-label="Increase number of tries"
            disabled={disabled || rounds >= 15}
            onClick={() => onRoundsChange(rounds + 1)}
          >
            +
          </Button>
        </div>
        <div
          className="mt-3 grid grid-cols-4 gap-1.5"
          role="group"
          aria-label="Quick choices for number of tries"
        >
          {[1, 5, 10, 15].map((tries) => (
            <button
              key={tries}
              type="button"
              aria-pressed={rounds === tries}
              disabled={disabled}
              onClick={() => onRoundsChange(tries)}
              className="rounded-md border border-border px-1 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary hover:text-primary focus-visible:outline-2 focus-visible:outline-primary disabled:opacity-50 aria-pressed:border-primary aria-pressed:bg-secondary aria-pressed:font-semibold aria-pressed:text-primary"
            >
              {tries}
            </button>
          ))}
        </div>
        <p className="mt-2 text-[0.65rem] text-muted-foreground">
          1–15 tries · more tries, greater confidence
        </p>
      </div>
      <Button
        className="min-h-[43px] w-full text-[0.72rem]"
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
    </aside>
  )
}
