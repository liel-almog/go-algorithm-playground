import type { Edge, MinCutResult, SolveResult } from './api'

type PuzzleMove = SolveResult['moves'][number]

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
    columns < 2
  ) {
    throw new Error('Puzzle dimensions must be integers of at least 2.')
  }
  if (!Number.isInteger(scramble) || scramble < 0) {
    throw new Error('Scramble must be a non-negative integer.')
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

export function solvePuzzleLocally(
  start: number[],
  rows: number,
  columns: number,
): SolveResult {
  const started = performance.now()
  const startKey = start.join(',')
  const goalKey = puzzleGoal(rows, columns).join(',')
  if (startKey === goalKey) return puzzleResult([start], [], 0, 1, started)

  type Node = {
    tiles: number[]
    key: string
    cost: number
    score: number
  }
  const open: Node[] = [
    { tiles: start, key: startKey, cost: 0, score: manhattan(start, columns) },
  ]
  const bestCost = new Map([[startKey, 0]])
  const parent = new Map<string, { key: string; move: PuzzleMove }>()
  const states = new Map([[startKey, start]])
  let expanded = 0
  let generated = 1
  let frontierMax = 1

  while (open.length > 0) {
    open.sort((a, b) => a.score - b.score)
    const current = open.shift()!
    if (current.cost !== bestCost.get(current.key)) continue
    expanded += 1

    for (const neighbor of puzzleNeighbors(current.tiles, rows, columns)) {
      const key = neighbor.tiles.join(',')
      const cost = current.cost + 1
      if (cost >= (bestCost.get(key) ?? Number.POSITIVE_INFINITY)) continue
      bestCost.set(key, cost)
      parent.set(key, { key: current.key, move: neighbor.move })
      states.set(key, neighbor.tiles)
      generated += 1
      if (key === goalKey) {
        const path: number[][] = []
        const moves: PuzzleMove[] = []
        let cursor = key
        while (cursor !== startKey) {
          const state = states.get(cursor)
          const link = parent.get(cursor)
          if (!state || !link) {
            throw new Error('Could not reconstruct the puzzle solution.')
          }
          path.push(state)
          moves.push(link.move)
          cursor = link.key
        }
        path.push(start)
        path.reverse()
        moves.reverse()
        return puzzleResult(
          path,
          moves,
          expanded,
          frontierMax,
          started,
          generated,
        )
      }
      open.push({
        tiles: neighbor.tiles,
        key,
        cost,
        score: cost + manhattan(neighbor.tiles, columns),
      })
    }
    frontierMax = Math.max(frontierMax, open.length)
  }

  throw new Error('This puzzle could not be solved.')
}

function puzzleNeighbors(tiles: number[], rows: number, columns: number) {
  const empty = tiles.indexOf(0)
  const row = Math.floor(empty / columns)
  const column = empty % columns
  const candidates: { position: number; move: PuzzleMove }[] = [
    { position: row > 0 ? empty - columns : -1, move: 'up' },
    { position: row < rows - 1 ? empty + columns : -1, move: 'down' },
    { position: column > 0 ? empty - 1 : -1, move: 'left' },
    { position: column < columns - 1 ? empty + 1 : -1, move: 'right' },
  ]
  return candidates
    .filter(({ position }) => position >= 0)
    .map(({ position, move }) => {
      const next = [...tiles]
      swapTiles(next, empty, position)
      return { tiles: next, move }
    })
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

function manhattan(tiles: number[], columns: number) {
  return tiles.reduce((distance, tile, index) => {
    if (tile === 0) return distance
    const target = tile - 1
    return (
      distance +
      Math.abs(Math.floor(index / columns) - Math.floor(target / columns)) +
      Math.abs((index % columns) - (target % columns))
    )
  }, 0)
}

function puzzleResult(
  path: number[][],
  moves: PuzzleMove[],
  expanded: number,
  frontierMax: number,
  started: number,
  generated = 1,
): SolveResult {
  return {
    algorithm: 'astar',
    path,
    moves,
    moveCount: moves.length,
    expanded,
    generated,
    frontierMax,
    durationUs: Math.round((performance.now() - started) * 1000),
    optimal: true,
  }
}

export function solveMinCutLocally(
  vertices: string[],
  edges: Edge[],
  trials: number,
): MinCutResult {
  if (vertices.length < 2) {
    throw new Error('Minimum cut requires at least two vertices.')
  }
  if (edges.length === 0) {
    throw new Error('Minimum cut requires at least one edge.')
  }
  if (!Number.isInteger(trials) || trials < 1) {
    throw new Error('Minimum cut requires at least one trial.')
  }

  const started = performance.now()
  let bestCut = Number.POSITIVE_INFINITY
  const firstVertex = vertices[0]
  if (firstVertex === undefined) {
    throw new Error('Minimum cut requires at least two vertices.')
  }
  let bestPartition: [string[], string[]] = [[firstVertex], vertices.slice(1)]

  for (let trial = 0; trial < trials; trial += 1) {
    const parent = new Map(vertices.map((vertex) => [vertex, vertex]))
    let groups = vertices.length

    const find = (vertex: string): string => {
      const next = parent.get(vertex)
      if (next === undefined) {
        throw new Error(`Unknown graph vertex: ${vertex}`)
      }
      if (next === vertex) return vertex
      const root = find(next)
      parent.set(vertex, root)
      return root
    }

    while (groups > 2) {
      const candidates = edges.filter(
        (edge) => find(edge.from) !== find(edge.to),
      )
      if (candidates.length === 0) break
      const edge = candidates[Math.floor(Math.random() * candidates.length)]
      if (!edge) break
      const fromRoot = find(edge.from)
      const toRoot = find(edge.to)
      parent.set(toRoot, fromRoot)
      groups -= 1
    }

    const firstRoot = find(firstVertex)
    const partition: [string[], string[]] = [
      vertices.filter((vertex) => find(vertex) === firstRoot),
      vertices.filter((vertex) => find(vertex) !== firstRoot),
    ]
    const left = new Set(partition[0])
    const cutSize = edges.filter(
      (edge) => left.has(edge.from) !== left.has(edge.to),
    ).length

    if (partition[1].length > 0 && cutSize < bestCut) {
      bestCut = cutSize
      bestPartition = partition
    }
  }

  const left = new Set(bestPartition[0])
  const singleTrialSuccess = 2 / (vertices.length * (vertices.length - 1))
  const confidence = 100 * (1 - (1 - singleTrialSuccess) ** trials)
  return {
    algorithm: 'karger',
    cutSize: bestCut,
    partitions: bestPartition,
    crossingEdges: edges.filter(
      (edge) => left.has(edge.from) !== left.has(edge.to),
    ),
    trials,
    confidence: Math.round(confidence * 10) / 10,
    durationUs: Math.round((performance.now() - started) * 1000),
  }
}
