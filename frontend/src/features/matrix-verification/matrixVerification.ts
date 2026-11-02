import type { MatrixClaim, MatrixTrial } from '../../lib/api'

type Matrix = number[][]

export function generateLocalProblem(size: number): MatrixClaim {
  const randomMatrix = () =>
    Array.from({ length: size }, () =>
      Array.from({ length: size }, () => Math.floor(Math.random() * 7) - 3),
    )
  const a = randomMatrix()
  const b = randomMatrix()
  return { a, b, product: multiplyMatrices(a, b) }
}

export function verifyLocally(
  problem: MatrixClaim,
  rounds: number,
): MatrixTrial[] {
  const size = problem.a.length
  return Array.from({ length: rounds }, () => {
    const vector = Array.from({ length: size }, () =>
      Math.random() < 0.5 ? 0 : 1,
    )
    const right = multiplyVector(problem.product, vector)
    const left = multiplyVector(problem.a, multiplyVector(problem.b, vector))
    return {
      vector,
      left,
      right,
      passed: left.every((value, index) => value === right[index]),
    }
  })
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

function multiplyVector(matrix: Matrix, vector: number[]) {
  if (matrix.some((row) => row.length !== vector.length)) {
    throw new Error('Matrix and vector dimensions do not match.')
  }
  return matrix.map((row) =>
    row.reduce((sum, value, index) => {
      const multiplier = vector[index]
      if (multiplier === undefined) {
        throw new Error('Matrix and vector dimensions do not match.')
      }
      return sum + value * multiplier
    }, 0),
  )
}
