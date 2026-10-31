import type { Edge, MinCutResult, SolveResult } from './api'

const puzzleGoal = '1,2,3,4,5,6,7,8,0'

export function generateLocalPuzzle(scramble: number) {
  const tiles = [1, 2, 3, 4, 5, 6, 7, 8, 0]
  let empty = 8
  let previous = -1

  for (let move = 0; move < scramble; move += 1) {
    const row = Math.floor(empty / 3)
    const column = empty % 3
    const options = [
      row > 0 ? empty - 3 : -1,
      row < 2 ? empty + 3 : -1,
      column > 0 ? empty - 1 : -1,
      column < 2 ? empty + 1 : -1,
    ].filter((position) => position >= 0 && position !== previous)
    const next = options[Math.floor(Math.random() * options.length)]
    previous = empty
    ;[tiles[empty], tiles[next]] = [tiles[next], tiles[empty]]
    empty = next
  }

  return tiles
}

export function solvePuzzleLocally(start: number[]): SolveResult {
  const started = performance.now()
  const startKey = start.join(',')
  if (startKey === puzzleGoal) return puzzleResult([start], [], 0, 1, started)

  type Node = {
    tiles: number[]
    key: string
    cost: number
    score: number
  }
  const open: Node[] = [
    { tiles: start, key: startKey, cost: 0, score: manhattan(start) },
  ]
  const bestCost = new Map([[startKey, 0]])
  const parent = new Map<string, { key: string; move: string }>()
  const states = new Map([[startKey, start]])
  let expanded = 0
  let generated = 1
  let frontierMax = 1

  while (open.length > 0) {
    open.sort((a, b) => a.score - b.score)
    const current = open.shift()!
    if (current.cost !== bestCost.get(current.key)) continue
    expanded += 1

    for (const neighbor of puzzleNeighbors(current.tiles)) {
      const key = neighbor.tiles.join(',')
      const cost = current.cost + 1
      if (cost >= (bestCost.get(key) ?? Number.POSITIVE_INFINITY)) continue
      bestCost.set(key, cost)
      parent.set(key, { key: current.key, move: neighbor.move })
      states.set(key, neighbor.tiles)
      generated += 1
      if (key === puzzleGoal) {
        const path: number[][] = []
        const moves: string[] = []
        let cursor = key
        while (cursor !== startKey) {
          path.push(states.get(cursor)!)
          const link = parent.get(cursor)!
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
        score: cost + manhattan(neighbor.tiles),
      })
    }
    frontierMax = Math.max(frontierMax, open.length)
  }

  throw new Error('This puzzle could not be solved.')
}

function puzzleNeighbors(tiles: number[]) {
  const empty = tiles.indexOf(0)
  const row = Math.floor(empty / 3)
  const column = empty % 3
  const candidates = [
    { position: row > 0 ? empty - 3 : -1, move: 'up' },
    { position: row < 2 ? empty + 3 : -1, move: 'down' },
    { position: column > 0 ? empty - 1 : -1, move: 'left' },
    { position: column < 2 ? empty + 1 : -1, move: 'right' },
  ]
  return candidates
    .filter(({ position }) => position >= 0)
    .map(({ position, move }) => {
      const next = [...tiles]
      ;[next[empty], next[position]] = [next[position], next[empty]]
      return { tiles: next, move }
    })
}

function manhattan(tiles: number[]) {
  return tiles.reduce((distance, tile, index) => {
    if (tile === 0) return distance
    const target = tile - 1
    return (
      distance +
      Math.abs(Math.floor(index / 3) - Math.floor(target / 3)) +
      Math.abs((index % 3) - (target % 3))
    )
  }, 0)
}

function puzzleResult(
  path: number[][],
  moves: string[],
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
  const started = performance.now()
  let bestCut = Number.POSITIVE_INFINITY
  let bestPartition: [string[], string[]] = [[vertices[0]], vertices.slice(1)]

  for (let trial = 0; trial < trials; trial += 1) {
    const parent = new Map(vertices.map((vertex) => [vertex, vertex]))
    let groups = vertices.length

    const find = (vertex: string): string => {
      const next = parent.get(vertex)!
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
      const fromRoot = find(edge.from)
      const toRoot = find(edge.to)
      parent.set(toRoot, fromRoot)
      groups -= 1
    }

    const firstRoot = find(vertices[0])
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
