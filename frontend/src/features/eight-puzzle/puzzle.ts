export function puzzleGoal(rows: number, columns: number) {
  return Array.from({ length: rows * columns }, (_, index) =>
    index === rows * columns - 1 ? 0 : index + 1,
  )
}

export function areAdjacent(first: number, second: number, columns: number) {
  if (first < 0 || second < 0) return false
  const rowDistance = Math.abs(
    Math.floor(first / columns) - Math.floor(second / columns),
  )
  const columnDistance = Math.abs((first % columns) - (second % columns))
  return rowDistance + columnDistance === 1
}

export function isSolved(tiles: number[], rows: number, columns: number) {
  const goal = puzzleGoal(rows, columns)
  return (
    tiles.length === goal.length && tiles.every((tile, i) => tile === goal[i])
  )
}

export function isValidPuzzle(tiles: number[], rows: number, columns: number) {
  const tileCount = rows * columns
  return (
    tiles.length === tileCount &&
    new Set(tiles).size === tileCount &&
    tiles.every(
      (tile) => Number.isInteger(tile) && tile >= 0 && tile < tileCount,
    )
  )
}

export function formatDuration(microseconds: number) {
  if (microseconds < 1000) return `${microseconds} μs`
  if (microseconds < 1_000_000) return `${(microseconds / 1000).toFixed(1)} ms`
  return `${(microseconds / 1_000_000).toFixed(2)} s`
}

export function errorMessage(reason: unknown) {
  return reason instanceof Error
    ? reason.message
    : 'The backend did not respond.'
}
