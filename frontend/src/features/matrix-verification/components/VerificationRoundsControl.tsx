import { Button } from '../../../components/ui/button'

interface VerificationRoundsControlProps {
  rounds: number
  disabled: boolean
  onChange: (rounds: number) => void
}

export function VerificationRoundsControl({
  rounds,
  disabled,
  onChange,
}: VerificationRoundsControlProps) {
  return (
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
          onClick={() => onChange(rounds - 1)}
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
            if (Number.isFinite(value)) onChange(value)
          }}
        />
        <Button
          variant="secondary"
          className="h-10 shadow-none"
          aria-label="Increase number of tries"
          disabled={disabled || rounds >= 15}
          onClick={() => onChange(rounds + 1)}
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
            onClick={() => onChange(tries)}
            className="rounded-md border border-border px-1 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary hover:text-primary focus-visible:outline-2 focus-visible:outline-primary disabled:opacity-50 aria-pressed:border-primary aria-pressed:bg-secondary aria-pressed:font-semibold aria-pressed:text-primary"
          >
            {tries}
          </button>
        ))}
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        1–15 tries · more tries, greater confidence
      </p>
    </div>
  )
}
