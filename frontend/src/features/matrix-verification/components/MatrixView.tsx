import { useState } from 'react'
import { cn } from '../../../lib/utils'

interface MatrixViewProps {
  label: string
  role: 'input' | 'result'
  matrix: number[][]
  original: number[][]
  disabled: boolean
  onChange: (row: number, column: number, value: number) => void
}

interface MatrixCellProps {
  label: string
  row: number
  column: number
  value: number
  disabled: boolean
  highlight: boolean
  onChange: (row: number, column: number, value: number) => void
}

function parseCellValue(value: string): number | null {
  return /^[01]$/.test(value) ? Number(value) : null
}

function MatrixCell({
  label,
  row,
  column,
  value,
  disabled,
  highlight,
  onChange,
}: MatrixCellProps) {
  const [draft, setDraft] = useState<string | null>(null)

  return (
    <input
      aria-label={`${label}, row ${row + 1}, column ${column + 1}`}
      className={cn(
        'aspect-square w-full min-w-0 rounded border border-[#dce3da] p-0 text-center font-mono text-xs leading-[normal] hover:border-primary focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary',
        highlight
          ? 'bg-[#f5d9cd] text-[#944e35]'
          : 'bg-[#f6f8f4] text-foreground',
      )}
      title={highlight ? 'Changed from the generated value' : undefined}
      type="text"
      inputMode="numeric"
      pattern="[01]"
      maxLength={1}
      value={draft ?? value}
      disabled={disabled}
      onFocus={(event) => event.currentTarget.select()}
      onBlur={() => setDraft(null)}
      onChange={(event) => {
        const nextValue = event.target.value
        if (nextValue === '') {
          setDraft('')
          return
        }
        const parsed = parseCellValue(nextValue)
        if (parsed === null) return
        setDraft(null)
        onChange(row, column, parsed)
      }}
    />
  )
}

export function MatrixView({
  label,
  role,
  matrix,
  original,
  disabled,
  onChange,
}: MatrixViewProps) {
  return (
    <fieldset
      className={cn(
        'min-w-0 rounded-lg border p-4',
        role === 'result' ? 'border-[#87ac95] bg-[#edf4ed]' : 'bg-white/94',
      )}
      data-role={role}
    >
      <legend className="mb-2.5 block font-mono text-[0.8rem] leading-[normal] font-medium text-primary">
        <span className="mr-2 text-base font-semibold">{label}</span>
        <span className="font-sans text-xs font-normal text-muted-foreground">
          {role === 'result' ? 'Claimed product' : 'Input matrix'} ·{' '}
          {matrix.length} × {matrix.length}
        </span>
      </legend>
      <div className="overflow-x-auto py-1">
        <div
          className="mx-auto grid w-max gap-0.5"
          style={{
            gridTemplateColumns: `repeat(${matrix.length}, 32px)`,
          }}
        >
          {matrix.flatMap((values, row) =>
            values.map((value, column) => (
              <MatrixCell
                key={`${row}-${column}`}
                label={label}
                row={row}
                column={column}
                value={value}
                disabled={disabled}
                highlight={value !== original[row]?.[column]}
                onChange={onChange}
              />
            )),
          )}
        </div>
      </div>
    </fieldset>
  )
}
