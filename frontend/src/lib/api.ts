import { z } from 'zod'

const nonNegativeInteger = z.number().int().nonnegative()
const positiveInteger = z.number().int().positive()

const algorithmSchema = z.strictObject({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string(),
  optimal: z.boolean(),
  category: z.string().min(1),
})

const algorithmsResponseSchema = z.strictObject({
  algorithms: z.array(algorithmSchema),
  tools: z.array(
    z.strictObject({
      id: z.string().min(1),
      name: z.string().min(1),
      category: z.string().min(1),
      endpoint: z.string().startsWith('/'),
    }),
  ),
})

const edgeSchema = z.strictObject({
  from: z.string().min(1),
  to: z.string().min(1),
})

const minCutResultSchema = z.strictObject({
  algorithm: z.string().min(1),
  cutSize: nonNegativeInteger,
  partitions: z.tuple([z.array(z.string()), z.array(z.string())]),
  crossingEdges: z.array(edgeSchema),
  trials: positiveInteger,
  confidence: z.number().min(0).max(100),
  durationUs: nonNegativeInteger,
})

function puzzleGenerationSchema(
  expectedRows: number,
  expectedColumns: number,
  expectedScramble: number,
) {
  return z
    .strictObject({
      row: z.number().int().min(2).max(4),
      column: z.number().int().min(2).max(4),
      tiles: z.array(nonNegativeInteger),
      scramble: z.number().int().min(1).max(200),
    })
    .superRefine((puzzle, context) => {
      if (
        puzzle.row !== expectedRows ||
        puzzle.column !== expectedColumns ||
        puzzle.scramble !== expectedScramble
      ) {
        context.addIssue({
          code: 'custom',
          message:
            'The backend returned dimensions or scramble values that do not match the request.',
        })
      }
      validateTiles(puzzle.tiles, puzzle.row, puzzle.column, context, ['tiles'])
    })
}

function puzzleSolveResultSchema(
  rows: number,
  columns: number,
  initialTiles: number[],
  expectedAlgorithm: string,
) {
  return z
    .strictObject({
      algorithm: z.enum(['astar', 'bfs', 'dfs']),
      path: z.array(z.array(nonNegativeInteger)).min(1),
      moves: z.array(z.enum(['up', 'right', 'down', 'left'])),
      moveCount: nonNegativeInteger,
      expanded: nonNegativeInteger,
      generated: nonNegativeInteger,
      frontierMax: nonNegativeInteger,
      durationUs: nonNegativeInteger,
      optimal: z.boolean(),
    })
    .superRefine((result, context) => {
      if (result.algorithm !== expectedAlgorithm) {
        context.addIssue({
          code: 'custom',
          message: 'The backend returned a result for a different algorithm.',
          path: ['algorithm'],
        })
      }
      result.path.forEach((tiles, index) =>
        validateTiles(tiles, rows, columns, context, ['path', index]),
      )
      if (
        result.moveCount !== result.moves.length ||
        result.path.length !== result.moves.length + 1
      ) {
        context.addIssue({
          code: 'custom',
          message: 'The returned path, moves, and move count are inconsistent.',
        })
      }
      if (!sameTiles(result.path[0], initialTiles)) {
        context.addIssue({
          code: 'custom',
          message: 'The solution path does not start with the requested board.',
          path: ['path', 0],
        })
      }
      const goal = Array.from({ length: rows * columns }, (_, index) =>
        index === rows * columns - 1 ? 0 : index + 1,
      )
      if (!sameTiles(result.path.at(-1), goal)) {
        context.addIssue({
          code: 'custom',
          message: 'The solution path does not end at the goal board.',
          path: ['path', result.path.length - 1],
        })
      }
      result.moves.forEach((move, index) => {
        if (
          !isLegalStep(
            result.path[index],
            result.path[index + 1],
            move,
            columns,
          )
        ) {
          context.addIssue({
            code: 'custom',
            message: 'The solution path contains an illegal tile move.',
            path: ['path', index + 1],
          })
        }
      })
    })
}

function sameTiles(left: number[] | undefined, right: number[]) {
  return (
    left?.length === right.length &&
    left.every((tile, index) => tile === right[index])
  )
}

function isLegalStep(
  current: number[],
  next: number[],
  move: 'up' | 'right' | 'down' | 'left',
  columns: number,
) {
  const currentBlank = current.indexOf(0)
  const nextBlank = next.indexOf(0)
  const delta = nextBlank - currentBlank
  const expectedDelta = { up: -columns, right: 1, down: columns, left: -1 }[
    move
  ]
  if (delta !== expectedDelta) return false

  return current.every((tile, index) => {
    if (index === currentBlank) return next[index] === current[nextBlank]
    if (index === nextBlank) return next[index] === 0
    return next[index] === tile
  })
}

function validateTiles(
  tiles: number[],
  rows: number,
  columns: number,
  context: z.RefinementCtx,
  path: PropertyKey[],
) {
  const tileCount = rows * columns
  const isPermutation =
    tiles.length === tileCount &&
    new Set(tiles).size === tileCount &&
    tiles.every((tile) => tile < tileCount)
  if (!isPermutation) {
    context.addIssue({
      code: 'custom',
      message: `Expected each tile from 0 to ${tileCount - 1} exactly once.`,
      path,
    })
  }
}

export type Algorithm = z.infer<typeof algorithmSchema>
export type AlgorithmCatalog = z.infer<typeof algorithmsResponseSchema>
export type AlgorithmTool = AlgorithmCatalog['tools'][number]
export type Edge = z.infer<typeof edgeSchema>
export type MinCutResult = z.infer<typeof minCutResultSchema>
export type SolveResult = z.infer<ReturnType<typeof puzzleSolveResultSchema>>

const apiBase = import.meta.env.VITE_API_BASE_URL ?? ''

async function request<TSchema extends z.ZodType>(
  path: string,
  schema: TSchema,
  options?: RequestInit,
): Promise<z.output<TSchema>> {
  const response = await fetch(`${apiBase}${path}`, options)
  const data: unknown = await response.json().catch(() => ({}))

  if (!response.ok) {
    const message =
      typeof data === 'object' && data !== null && 'error' in data
        ? String(data.error)
        : `Request failed (${response.status})`
    throw new Error(message)
  }

  const parsed = schema.safeParse(data)
  if (!parsed.success) {
    throw new Error(
      `The backend returned an invalid response.\n${z.prettifyError(parsed.error)}`,
    )
  }
  return parsed.data
}

const jsonHeaders = { 'Content-Type': 'application/json' }

export const api = {
  algorithms: (signal?: AbortSignal) =>
    request('/api/algorithms', algorithmsResponseSchema, { signal }),

  randomPuzzle: (rows: number, columns: number, scramble: number) =>
    request(
      '/api/problems/eight-puzzle/generate',
      puzzleGenerationSchema(rows, columns, scramble),
      {
        method: 'POST',
        headers: jsonHeaders,
        body: JSON.stringify({ row: rows, column: columns, scramble }),
      },
    ),

  solvePuzzle: (
    rows: number,
    columns: number,
    tiles: number[],
    algorithm: string,
  ) =>
    request(
      '/api/problems/eight-puzzle/solve',
      puzzleSolveResultSchema(rows, columns, tiles, algorithm),
      {
        method: 'POST',
        headers: jsonHeaders,
        body: JSON.stringify({ row: rows, column: columns, tiles, algorithm }),
      },
    ),

  minimumCut: (vertices: string[], edges: Edge[], trials: number) =>
    request('/api/problems/minimum-cut/solve', minCutResultSchema, {
      method: 'POST',
      headers: jsonHeaders,
      body: JSON.stringify({ vertices, edges, trials }),
    }),
}
