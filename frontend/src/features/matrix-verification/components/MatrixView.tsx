import verifierStyles from '../../../components/verifier.module.css'

interface MatrixViewProps {
  label: string
  matrix: number[][]
  highlight?: boolean
}

export function MatrixView({
  label,
  matrix,
  highlight = false,
}: MatrixViewProps) {
  return (
    <div className={verifierStyles['matrix-block']}>
      <span>{label}</span>
      <div
        className={verifierStyles['matrix-grid']}
        style={{ gridTemplateColumns: `repeat(${matrix.length}, 1fr)` }}
      >
        {matrix.flatMap((row, rowIndex) =>
          row.map((value, columnIndex) => (
            <i
              key={`${rowIndex}-${columnIndex}`}
              className={
                highlight && rowIndex === 0 && columnIndex === 0
                  ? verifierStyles['changed-cell']
                  : ''
              }
            >
              {value}
            </i>
          )),
        )}
      </div>
    </div>
  )
}
