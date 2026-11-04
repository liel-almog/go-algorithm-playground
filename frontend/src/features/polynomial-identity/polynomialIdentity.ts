export const prime = 101

export function randomCoefficients(degree: number) {
  return Array.from({ length: degree + 1 }, () =>
    Math.floor(Math.random() * 13),
  )
}
