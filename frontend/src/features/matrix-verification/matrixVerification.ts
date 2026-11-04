import type { MatrixClaim } from '../../lib/api'

type Matrix = number[][]

export function generateLocalProblem(size: number): MatrixClaim {
  const randomMatrix = () =>
    Array.from({ length: size }, () =>
      Array.from({ length: size }, () => Math.floor(Math.random() * 2)),
    )
  const a = randomMatrix()
  const b = Array.from({ length: size }, () =>
    Array.from({ length: size }, () => 0),
  )
  for (const [row, column] of shuffledColumns(size).entries()) {
    const values = b[row]
    if (values) values[column] = 1
  }
  return { a, b, product: multiplyMatrices(a, b) }
}

function shuffledColumns(size: number) {
  const columns = Array.from({ length: size }, (_, index) => index)
  for (let index = size - 1; index > 0; index--) {
    const randomIndex = Math.floor(Math.random() * (index + 1))
    const current = columns[index]
    const next = columns[randomIndex]
    if (current !== undefined && next !== undefined) {
      columns[index] = next
      columns[randomIndex] = current
    }
  }
  return columns
}

function multiplyMatrices(a: Matrix, b: Matrix) {
  const columnCount = b[0]?.length
  if (columnCount === undefined || columnCount === 0) {
    throw new Error('Matrices must not be empty.')
  }
  if (
    a.some((row) => row.length !== b.length) ||
    b.some((row) => row.length !== columnCount)
  ) {
    throw new Error('Matrix dimensions do not support multiplication.')
  }

  return a.map((row) =>
    Array.from({ length: columnCount }, (_, column) =>
      row.reduce((sum, value, index) => {
        const multiplier = b[index]?.[column]
        if (multiplier === undefined) {
          throw new Error('Matrix rows must have consistent dimensions.')
        }
        return sum + value * multiplier
      }, 0),
    ),
  )
}

export function claimsDiffer(claim: MatrixClaim, original: MatrixClaim) {
  return (['a', 'b', 'product'] as const).some((matrix) =>
    claim[matrix].some((row, rowIndex) =>
      row.some(
        (value, columnIndex) =>
          value !== original[matrix][rowIndex]?.[columnIndex],
      ),
    ),
  )
}

export function updateMatrixCell(
  claim: MatrixClaim,
  matrix: keyof MatrixClaim,
  rowIndex: number,
  columnIndex: number,
  value: number,
): MatrixClaim {
  const updated = claim[matrix].map((row) => [...row])
  const row = updated[rowIndex]
  if (!row) return claim
  row[columnIndex] = value
  return { ...claim, [matrix]: updated }
}
