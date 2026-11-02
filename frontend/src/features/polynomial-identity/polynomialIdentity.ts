import type { PolynomialCheck } from '../../lib/api'

export const prime = 101

export function randomCoefficients(degree: number) {
  return Array.from({ length: degree + 1 }, () =>
    Math.floor(Math.random() * 13),
  )
}

export function verifyLocally(
  left: number[],
  right: number[],
  rounds: number,
): PolynomialCheck[] {
  return Array.from({ length: rounds }, () => {
    const point = 1 + Math.floor(Math.random() * (prime - 1))
    const leftValue = evaluate(left, point)
    const rightValue = evaluate(right, point)
    return {
      point,
      left: leftValue,
      right: rightValue,
      passed: leftValue === rightValue,
    }
  })
}

function evaluate(coefficients: number[], point: number) {
  return coefficients.reduceRight(
    (value, coefficient) => (value * point + coefficient) % prime,
    0,
  )
}
