import type { z } from 'zod'
import {
  algorithmsResponseSchema,
  graphSchema,
  matrixClaimSchema,
  matrixResultSchema,
  minCutResultSchema,
  polynomialIdentitySchema,
  polynomialResultSchema,
  puzzleGenerationSchema,
  puzzleSolveResultSchema,
  puzzleGenerateRequestSchema,
  puzzleSolveRequestSchema,
  minCutRequestSchema,
  matrixRequestSchema,
  polynomialRequestSchema,
  graphGenerateRequestSchema,
  matrixGenerateRequestSchema,
  polynomialGenerateRequestSchema,
} from './apiSchemas'
import type { Edge, MatrixClaim, PolynomialIdentity } from './apiSchemas'

export type {
  Algorithm,
  AlgorithmCatalog,
  AlgorithmTool,
  Edge,
  Graph,
  MatrixClaim,
  MatrixTrial,
  MatrixResult,
  MinCutResult,
  PolynomialIdentity,
  PolynomialCheck,
  PolynomialResult,
  SolveResult,
} from './apiSchemas'

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

const apiBase = import.meta.env.VITE_API_BASE_URL ?? ''

async function request<TSchema extends z.ZodType>(
  path: string,
  schema: TSchema,
  options?: RequestInit,
): Promise<z.output<TSchema>> {
  const timeout = AbortSignal.timeout(15_000)
  let response: Response
  try {
    response = await fetch(`${apiBase.replace(/\/$/, '')}${path}`, {
      ...options,
      signal: options?.signal
        ? AbortSignal.any([options.signal, timeout])
        : timeout,
    })
  } catch (error) {
    if (options?.signal?.aborted) throw error
    throw new Error(
      timeout.aborted
        ? 'The request timed out. Please try again.'
        : 'Could not reach the server. Check your connection and try again.',
      { cause: error },
    )
  }
  const data: unknown = await response.json().catch(() => ({}))

  if (!response.ok) {
    const message =
      typeof data === 'object' &&
      data !== null &&
      'error' in data &&
      typeof data.error === 'string'
        ? data.error
        : `Request failed (${response.status})`
    throw new ApiError(message, response.status)
  }

  const parsed = schema.safeParse(data)
  if (!parsed.success) {
    throw new Error(
      'The server returned an invalid response. Please try again.',
    )
  }
  return parsed.data
}

function post<TInput extends z.ZodType, TOutput extends z.ZodType>(
  path: string,
  inputSchema: TInput,
  outputSchema: TOutput,
  input: z.input<TInput>,
  signal?: AbortSignal,
) {
  return request(path, outputSchema, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(inputSchema.parse(input)),
    ...(signal ? { signal } : {}),
  })
}

export const api = {
  algorithms: (signal?: AbortSignal) =>
    request(
      '/api/algorithms',
      algorithmsResponseSchema,
      signal ? { signal } : undefined,
    ),
  randomPuzzle: (rows: number, columns: number, scramble: number) =>
    post(
      '/api/problems/eight-puzzle/generate',
      puzzleGenerateRequestSchema,
      puzzleGenerationSchema(rows, columns, scramble),
      { row: rows, column: columns, scramble },
    ),
  solvePuzzle: (
    rows: number,
    columns: number,
    tiles: number[],
    algorithm: 'astar' | 'bfs' | 'dfs',
    signal?: AbortSignal,
  ) =>
    post(
      '/api/problems/eight-puzzle/solve',
      puzzleSolveRequestSchema,
      puzzleSolveResultSchema(rows, columns, tiles, algorithm),
      { row: rows, column: columns, tiles, algorithm },
      signal,
    ),
  minimumCut: (vertices: string[], edges: Edge[], trials: number) =>
    post(
      '/api/problems/minimum-cut/solve',
      minCutRequestSchema,
      minCutResultSchema,
      { vertices, edges, trials },
    ),
  randomGraph: (vertices: number) =>
    post(
      '/api/problems/minimum-cut/generate',
      graphGenerateRequestSchema,
      graphSchema,
      { vertices },
    ),
  randomMatrices: (size: number) =>
    post(
      '/api/problems/matrix-verification/generate',
      matrixGenerateRequestSchema,
      matrixClaimSchema,
      { size },
    ),
  verifyMatrices: (claim: MatrixClaim, rounds: number) =>
    post(
      '/api/problems/matrix-verification/solve',
      matrixRequestSchema,
      matrixResultSchema,
      { ...claim, rounds },
    ),
  randomPolynomial: (degree: number) =>
    post(
      '/api/problems/polynomial-identity/generate',
      polynomialGenerateRequestSchema,
      polynomialIdentitySchema,
      { degree },
    ),
  verifyPolynomial: (identity: PolynomialIdentity, rounds: number) =>
    post(
      '/api/problems/polynomial-identity/solve',
      polynomialRequestSchema,
      polynomialResultSchema,
      { ...identity, rounds },
    ),
}
