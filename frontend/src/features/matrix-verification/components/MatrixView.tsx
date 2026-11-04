import { useState } from 'react'
import verifierStyles from '../../../components/verifier.module.css'

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
      className={highlight ? verifierStyles['changed-cell'] : undefined}
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
    <fieldset className={verifierStyles['matrix-block']} data-role={role}>
      <legend>
        <span className="mr-2 text-base font-semibold">{label}</span>
        <span className="font-sans text-xs font-normal text-muted-foreground">
          {role === 'result' ? 'Claimed product' : 'Input matrix'} ·{' '}
          {matrix.length} × {matrix.length}
        </span>
      </legend>
      <div
        className={verifierStyles['matrix-grid']}
        style={{
          gridTemplateColumns: `repeat(${matrix.length}, minmax(0, 1fr))`,
          width: `min(100%, ${matrix.length * 32}px)`,
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
    </fieldset>
  )
}
