import { puzzleGoal } from './puzzle'

export function generateLocalPuzzle(
  rows: number,
  columns: number,
  scramble: number,
) {
  if (
    !Number.isInteger(rows) ||
    !Number.isInteger(columns) ||
    rows < 2 ||
    rows > 4 ||
    columns < 2 ||
    columns > 4
  ) {
    throw new Error('Puzzle dimensions must be integers between 2 and 4.')
  }
  if (!Number.isInteger(scramble) || scramble < 1 || scramble > 200) {
    throw new Error('Scramble must be an integer between 1 and 200.')
  }

  const tiles = puzzleGoal(rows, columns)
  const goalKey = tiles.join(',')
  let emptyIndex = tiles.length - 1
  let previousEmptyIndex = -1

  for (let move = 0; move < scramble; move += 1) {
    // Avoid immediately undoing the last move.
    const neighbors = neighboringIndices(emptyIndex, rows, columns).filter(
      (index) => index !== previousEmptyIndex,
    )
    const nextEmptyIndex =
      neighbors[Math.floor(Math.random() * neighbors.length)]
    if (nextEmptyIndex === undefined) {
      throw new Error('Could not find a legal puzzle move.')
    }
    previousEmptyIndex = emptyIndex
    swapTiles(tiles, emptyIndex, nextEmptyIndex)
    emptyIndex = nextEmptyIndex
  }

  // A longer random walk can occasionally loop back to the goal. Keep every
  // generated exercise meaningful while preserving solvability.
  if (tiles.join(',') === goalKey) {
    // At the goal, the empty cell is in the bottom-right corner.
    swapTiles(tiles, emptyIndex, emptyIndex - 1)
  }

  return tiles
}

function neighboringIndices(index: number, rows: number, columns: number) {
  const row = Math.floor(index / columns)
  const column = index % columns
  const neighbors: number[] = []

  if (row > 0) neighbors.push(index - columns)
  if (row < rows - 1) neighbors.push(index + columns)
  if (column > 0) neighbors.push(index - 1)
  if (column < columns - 1) neighbors.push(index + 1)

  return neighbors
}

function swapTiles(tiles: number[], first: number, second: number) {
  const firstTile = tiles[first]
  const secondTile = tiles[second]
  if (firstTile === undefined || secondTile === undefined) {
    throw new Error('Cannot move a tile outside the puzzle board.')
  }
  tiles[first] = secondTile
  tiles[second] = firstTile
}
