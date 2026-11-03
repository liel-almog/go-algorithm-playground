import { Input } from '../../../components/ui/input'

const prime = 101

interface CoefficientEditorProps {
  name: string
  coefficients: number[]
  disabled: boolean
  onChange: (index: number, value: number) => void
}

export function CoefficientEditor({
  name,
  coefficients,
  disabled,
  onChange,
}: CoefficientEditorProps) {
  return (
    <div className="min-w-0 rounded-[9px] border border-border bg-white/85 p-[18px]">
      <strong className="mb-[14px] block font-['DM_Mono'] text-[0.78rem] text-secondary-foreground">
        {name}
      </strong>
      <div className="grid grid-cols-3 gap-2">
        {coefficients.map((coefficient, index) => (
          <label key={index} className="relative">
            <span className="absolute top-[5px] right-[6px] text-[0.48rem] text-[#9a9f99]">
              {index === 0 ? '1' : index === 1 ? 'x' : `x${index}`}
            </span>
            <Input
              className="h-10 rounded-[5px] border-[#dfe2dc] bg-[#f8f9f5] px-[7px] pt-[13px] pb-[5px] font-['DM_Mono'] text-[0.68rem] shadow-none"
              type="number"
              min="0"
              max="100"
              value={coefficient}
              disabled={disabled}
              onChange={(event) =>
                onChange(
                  index,
                  ((Number(event.target.value) % prime) + prime) % prime,
                )
              }
            />
          </label>
        ))}
      </div>
    </div>
  )
}
