function puzzleGoal(rows: number, columns: number) {
  return Array.from({ length: rows * columns }, (_, index) =>
    index === rows * columns - 1 ? 0 : index + 1,
  )
}

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
  let empty = tiles.length - 1
  let previous = -1

  for (let move = 0; move < scramble; move += 1) {
    const row = Math.floor(empty / columns)
    const column = empty % columns
    const options = [
      row > 0 ? empty - columns : -1,
      row < rows - 1 ? empty + columns : -1,
      column > 0 ? empty - 1 : -1,
      column < columns - 1 ? empty + 1 : -1,
    ].filter((position) => position >= 0 && position !== previous)
    const next = options[Math.floor(Math.random() * options.length)]
    if (next === undefined) {
      throw new Error('Could not find a legal puzzle move.')
    }
    previous = empty
    swapTiles(tiles, empty, next)
    empty = next
  }

  // A longer random walk can occasionally loop back to the goal. Keep every
  // generated exercise meaningful while preserving solvability.
  if (tiles.join(',') === goalKey) {
    const next = empty === tiles.length - 1 ? empty - 1 : empty + 1
    swapTiles(tiles, empty, next)
  }

  return tiles
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
