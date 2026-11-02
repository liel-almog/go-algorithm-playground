import type { ReactNode } from 'react'

interface RangeControlProps {
  label: ReactNode
  value: ReactNode
  inputValue: number
  min: number
  max: number
  step?: number
  disabled?: boolean
  startLabel: ReactNode
  endLabel: ReactNode
  onChange: (value: number) => void
}

export function RangeControl({
  label,
  value,
  inputValue,
  min,
  max,
  step,
  disabled,
  startLabel,
  endLabel,
  onChange,
}: RangeControlProps) {
  return (
    <label className="range-control">
      <span>
        {label} <strong>{value}</strong>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={inputValue}
        disabled={disabled}
        onChange={(event) => onChange(Number(event.target.value))}
      />
      <small>
        <span>{startLabel}</span>
        <span>{endLabel}</span>
      </small>
    </label>
  )
}
