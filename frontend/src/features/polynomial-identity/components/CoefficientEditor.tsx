import { useState } from 'react'
import { Input } from '../../../components/ui/input'

interface CoefficientEditorProps {
  name: string
  coefficients: number[]
  disabled: boolean
  onChange: (index: number, value: number) => void
}

function CoefficientInput({
  name,
  index,
  value,
  disabled,
  onChange,
}: {
  name: string
  index: number
  value: number
  disabled: boolean
  onChange: (index: number, value: number) => void
}) {
  const [draft, setDraft] = useState<string | null>(null)
  return (
    <label className="flex flex-col gap-1 text-sm text-muted-foreground">
      <span>
        {index === 0 ? (
          'Constant'
        ) : (
          <>
            x<sup>{index}</sup>
          </>
        )}
      </span>
      <Input
        className="h-11 bg-white font-mono text-base"
        aria-label={`${name}, coefficient of x to the power ${index}`}
        type="number"
        min={0}
        max={100}
        step={1}
        value={draft ?? value}
        disabled={disabled}
        onFocus={(event) => event.currentTarget.select()}
        onBlur={() => setDraft(null)}
        onChange={(event) => {
          if (event.target.value === '') {
            setDraft('')
            return
          }
          const next = event.target.valueAsNumber
          if (!Number.isInteger(next) || next < 0 || next > 100) return
          setDraft(null)
          onChange(index, next)
        }}
      />
    </label>
  )
}

export function CoefficientEditor({
  name,
  coefficients,
  disabled,
  onChange,
}: CoefficientEditorProps) {
  return (
    <fieldset className="min-w-0 rounded-lg border border-border bg-white/85 p-4">
      <legend className="px-1 font-mono text-base text-secondary-foreground">
        {name}
      </legend>
      <div className="grid grid-cols-3 gap-2">
        {coefficients.map((coefficient, index) => (
          <CoefficientInput
            key={index}
            name={name}
            index={index}
            value={coefficient}
            disabled={disabled}
            onChange={onChange}
          />
        ))}
      </div>
    </fieldset>
  )
}
