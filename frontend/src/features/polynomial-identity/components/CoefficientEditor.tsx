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
    <div className="coefficient-editor">
      <strong>{name}</strong>
      <div>
        {coefficients.map((coefficient, index) => (
          <label key={index}>
            <span>{index === 0 ? '1' : index === 1 ? 'x' : `x${index}`}</span>
            <input
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
