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
    <label className="mt-[25px] mb-[18px] block">
      <span className="flex justify-between text-[0.67rem] text-[#737d75]">
        {label}{' '}
        <strong className="font-['DM_Mono'] text-foreground">{value}</strong>
      </span>
      <input
        className="my-[15px] mb-2 h-1 w-full cursor-pointer accent-primary"
        type="range"
        min={min}
        max={max}
        step={step}
        value={inputValue}
        disabled={disabled}
        onChange={(event) => onChange(Number(event.target.value))}
      />
      <small className="flex justify-between text-[0.56rem] text-[#9aa19a]">
        <span>{startLabel}</span>
        <span>{endLabel}</span>
      </small>
    </label>
  )
}
