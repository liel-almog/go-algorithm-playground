import {
  puzzleGenerateRequestSchema,
  puzzleGenerationSchema,
  puzzleSolveRequestSchema,
  puzzleSolveResultSchema,
} from '../lib/apiSchemas'
import { apiInstance, errorHelper, parseResponse } from './index.service'

const PREFIX = 'problems/eight-puzzle' as const

export const eightPuzzleService = {
  async generate(rows: number, columns: number, scramble: number) {
    try {
      const data = puzzleGenerateRequestSchema.parse({
        row: rows,
        column: columns,
        scramble,
      })
      const res = await apiInstance.post(`${PREFIX}/generate`, data)
      return parseResponse(
        puzzleGenerationSchema(rows, columns, scramble),
        res.data,
      )
    } catch (error) {
      throw errorHelper(error)
    }
  },

  async solve(
    rows: number,
    columns: number,
    tiles: number[],
    algorithm: 'astar' | 'bfs' | 'dfs',
    signal?: AbortSignal,
  ) {
    try {
      const data = puzzleSolveRequestSchema.parse({
        row: rows,
        column: columns,
        tiles,
      })
      const res = await apiInstance.post(
        `${PREFIX}/${algorithm}/solve`,
        data,
        signal ? { signal } : undefined,
      )
      return parseResponse(
        puzzleSolveResultSchema(rows, columns, tiles, algorithm),
        res.data,
      )
    } catch (error) {
      throw errorHelper(error)
    }
  },
} as const
