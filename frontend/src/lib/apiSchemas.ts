import { z } from 'zod'
import { isValidPuzzle, puzzleGoal } from './puzzle'

export const nonNegativeInteger = z.number().int().nonnegative()
const positiveInteger = z.number().int().positive()

export const algorithmSchema = z.strictObject({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string(),
  optimal: z.boolean(),
  category: z.string().min(1),
})

export const algorithmsResponseSchema = z.strictObject({
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

const vertexSchema = z
  .string()
  .min(1)
  .refine(
    (name) =>
      Array.from(name).length <= 100 &&
      name.trim().length > 0 &&
      !/[\p{Cc}]/u.test(name),
    'Use a nonempty vertex name without control characters.',
  )

export const edgeSchema = z.strictObject({
  from: vertexSchema,
  to: vertexSchema,
})

export const graphSchema = z
  .strictObject({
    vertices: z.array(vertexSchema).min(2).max(50),
    edges: z.array(edgeSchema).min(1).max(1000),
  })
  .superRefine(({ vertices, edges }, context) => {
    const vertexNames = new Set(vertices)
    if (vertexNames.size !== vertices.length) {
      context.addIssue({
        code: 'custom',
        message: 'Vertex names must be unique.',
      })
    }
    const hasInvalidEdge = edges.some(
      ({ from, to }) =>
        !vertexNames.has(from) || !vertexNames.has(to) || from === to,
    )
    if (hasInvalidEdge) {
      context.addIssue({
        code: 'custom',
        message: 'Edges must join two different vertices in the graph.',
      })
      return
    }
    if (!isConnectedGraph(vertices, edges)) {
      context.addIssue({
        code: 'custom',
        message: 'The graph must be connected.',
      })
    }
  })

function isConnectedGraph(vertices: string[], edges: Edge[]) {
  const pending = vertices.slice(0, 1)
  const visited = new Set(pending)

  while (pending.length > 0) {
    const vertex = pending.pop()
    for (const { from, to } of edges) {
      if (from !== vertex && to !== vertex) continue
      const neighbor = from === vertex ? to : from
      if (visited.has(neighbor)) continue
      visited.add(neighbor)
      pending.push(neighbor)
    }
  }

  return visited.size === new Set(vertices).size
}

export const matrixSchema = z
  .array(z.array(z.number().int().min(0).max(1)).min(1).max(100))
  .min(1)
  .max(100)
  .refine(
    (matrix) => matrix.every((row) => row.length === matrix.length),
    'Matrices must be square.',
  )

export const matrixClaimSchema = z
  .strictObject({
    a: matrixSchema,
    b: matrixSchema,
    product: matrixSchema,
  })
  .refine(
    ({ a, b, product }) => a.length === b.length && a.length === product.length,
    'Matrices must have the same dimensions.',
  )

export const matrixTrialSchema = z.strictObject({
  vector: z.array(z.number().int()),
  left: z.array(z.number().int()),
  right: z.array(z.number().int()),
  passed: z.boolean(),
})

export const matrixResultSchema = z.strictObject({
  algorithm: z.literal('freivalds'),
  accepted: z.boolean(),
  trials: z.array(matrixTrialSchema).min(1).max(15),
  falsePositiveBound: z.number().min(0).max(1),
})

export const polynomialIdentitySchema = z.strictObject({
  left: z.array(nonNegativeInteger.max(100)).min(1).max(21),
  right: z.array(nonNegativeInteger.max(100)).min(1).max(21),
})

export const polynomialCheckSchema = z.strictObject({
  point: positiveInteger.max(100),
  left: nonNegativeInteger.max(100),
  right: nonNegativeInteger.max(100),
  passed: z.boolean(),
})

export const polynomialResultSchema = z.strictObject({
  algorithm: z.literal('schwartz-zippel'),
  accepted: z.boolean(),
  checks: z.array(polynomialCheckSchema).min(1).max(10),
  prime: z.literal(101),
  falsePositiveBound: z.number().min(0).max(1),
})

export const minCutResultSchema = z.strictObject({
  algorithm: z.literal('karger'),
  cutSize: nonNegativeInteger,
  partitions: z.tuple([z.array(z.string()), z.array(z.string())]),
  crossingEdges: z.array(edgeSchema),
  trials: positiveInteger,
  confidence: z.number().min(0).max(100),
  durationUs: nonNegativeInteger,
})

export function puzzleGenerationSchema(
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

export function puzzleSolveResultSchema(
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
      const goal = puzzleGoal(rows, columns)
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
  current: number[] | undefined,
  next: number[] | undefined,
  move: 'up' | 'right' | 'down' | 'left',
  columns: number,
) {
  if (!current || !next) return false
  const currentBlank = current.indexOf(0)
  const nextBlank = next.indexOf(0)
  const delta = nextBlank - currentBlank
  const expectedDelta = { up: -columns, right: 1, down: columns, left: -1 }[
    move
  ]
  if (delta !== expectedDelta) return false
  const isHorizontalMove = move === 'left' || move === 'right'
  const staysInSameRow =
    Math.floor(currentBlank / columns) === Math.floor(nextBlank / columns)
  if (isHorizontalMove && !staysInSameRow) return false

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
  if (!isValidPuzzle(tiles, rows, columns)) {
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
export type Graph = z.infer<typeof graphSchema>
export type MatrixClaim = z.infer<typeof matrixClaimSchema>
export type MatrixTrial = z.infer<typeof matrixTrialSchema>
export type MatrixResult = z.infer<typeof matrixResultSchema>
export type MinCutResult = z.infer<typeof minCutResultSchema>
export type PolynomialIdentity = z.infer<typeof polynomialIdentitySchema>
export type PolynomialCheck = z.infer<typeof polynomialCheckSchema>
export type PolynomialResult = z.infer<typeof polynomialResultSchema>
export type SolveResult = z.infer<ReturnType<typeof puzzleSolveResultSchema>>

export const puzzleGenerateRequestSchema = z.strictObject({
  row: z.number().int().min(2).max(4),
  column: z.number().int().min(2).max(4),
  scramble: z.number().int().min(1).max(200),
})

export const puzzleSolveRequestSchema = puzzleGenerateRequestSchema
  .omit({ scramble: true })
  .extend({
    tiles: z.array(nonNegativeInteger).min(4).max(16),
  })
  .superRefine((puzzle, context) =>
    validateTiles(puzzle.tiles, puzzle.row, puzzle.column, context, ['tiles']),
  )

export const minCutRequestSchema = graphSchema
  .safeExtend({ trials: z.number().int().min(1).max(500) })
  .refine(
    ({ edges, trials }) => edges.length * trials <= 250_000,
    'Edges multiplied by trials must not exceed 250000.',
  )
export const matrixRequestSchema = matrixClaimSchema.safeExtend({
  rounds: z.number().int().min(1).max(15),
})
export const polynomialRequestSchema = polynomialIdentitySchema.extend({
  rounds: z.number().int().min(1).max(10),
})

export const graphGenerateRequestSchema = z.strictObject({
  vertices: z.number().int().min(3).max(50),
})
export const matrixGenerateRequestSchema = z.strictObject({
  size: z.number().int().min(1).max(100),
})
export const polynomialGenerateRequestSchema = z.strictObject({
  degree: z.number().int().min(1).max(20),
})
