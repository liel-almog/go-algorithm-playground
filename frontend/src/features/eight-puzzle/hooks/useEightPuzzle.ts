import { useMutation, useQuery } from '@tanstack/react-query'
import { useCallback, useEffect, useRef, useState } from 'react'
import {
  findPuzzleAlgorithm,
  fallbackAlgorithmCatalog,
  isPuzzleAlgorithm,
  defaultPuzzleAlgorithm,
  puzzleAlgorithms as fallbackPuzzleAlgorithms,
} from '../../../lib/algorithms'
import type { SolveResult } from '../../../lib/api'
import { generateLocalPuzzle } from '../../../lib/clientAlgorithms'
import { areAdjacent, errorMessage, isSolved } from '../puzzle'
import { puzzleMutations } from '../mutations'
import { algorithmQueries } from '../../algorithms/queries'

export function useEightPuzzle() {
  const [algorithmId, setAlgorithmId] = useState('astar')
  const { data: serverAlgorithms } = useQuery({
    ...algorithmQueries.catalog(),
    placeholderData: fallbackAlgorithmCatalog,
    select: (catalog) => catalog.algorithms.filter(isPuzzleAlgorithm),
  })
  const algorithms =
    serverAlgorithms && serverAlgorithms.length > 0
      ? serverAlgorithms
      : fallbackPuzzleAlgorithms
  const algorithm =
    findPuzzleAlgorithm(algorithmId, algorithms) ?? defaultPuzzleAlgorithm
  const [tiles, setTiles] = useState<number[]>([])
  const [initialTiles, setInitialTiles] = useState<number[]>([])
  const [rows, setRows] = useState(3)
  const [columns, setColumns] = useState(3)
  const [scramble, setScramble] = useState(18)
  const [playerMoves, setPlayerMoves] = useState(0)
  const [result, setResult] = useState<SolveResult | null>(null)
  const [step, setStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [generationSource, setGenerationSource] = useState<
    'backend' | 'local' | null
  >(null)
  const didGenerate = useRef(false)
  const {
    mutateAsync: generatePuzzle,
    reset: resetGeneration,
    isPending: isGenerating,
  } = useMutation(puzzleMutations.generate())
  const {
    mutateAsync: solvePuzzle,
    reset: resetSolve,
    isPending: isSolving,
    error: solveError,
  } = useMutation(puzzleMutations.solve())
  const error = solveError ? errorMessage(solveError) : ''
  const playerSolved = isSolved(tiles, rows, columns)

  const clearSolution = useCallback(() => {
    setResult(null)
    setStep(0)
    setIsPlaying(false)
  }, [])

  const setNewPuzzle = useCallback(
    (nextTiles: number[]) => {
      setTiles(nextTiles)
      setInitialTiles(nextTiles)
      setPlayerMoves(0)
      clearSolution()
    },
    [clearSolution],
  )

  const generateProblem = useCallback(
    async (dimensions?: { rows: number; columns: number }) => {
      const requestedRows = dimensions?.rows ?? rows
      const requestedColumns = dimensions?.columns ?? columns

      resetGeneration()
      resetSolve()
      try {
        const puzzle = await generatePuzzle({
          rows: requestedRows,
          columns: requestedColumns,
          scramble,
        })
        setNewPuzzle(puzzle.tiles)
        setGenerationSource('backend')
      } catch {
        setNewPuzzle(
          generateLocalPuzzle(requestedRows, requestedColumns, scramble),
        )
        setGenerationSource('local')
        resetGeneration()
      }
    },
    [
      columns,
      generatePuzzle,
      resetGeneration,
      resetSolve,
      rows,
      scramble,
      setNewPuzzle,
    ],
  )

  useEffect(() => {
    if (didGenerate.current) return
    didGenerate.current = true
    void generateProblem()
  }, [generateProblem])

  useEffect(() => {
    if (!isPlaying || !result) return
    if (step >= result.path.length - 1) {
      setIsPlaying(false)
      return
    }
    const timer = window.setTimeout(
      () => setStep((current) => current + 1),
      650,
    )
    return () => window.clearTimeout(timer)
  }, [isPlaying, result, step])

  const runAlgorithm = useCallback(async () => {
    if (tiles.length === 0) return
    resetSolve()
    clearSolution()
    try {
      setResult(
        await solvePuzzle({
          rows,
          columns,
          tiles,
          algorithm: algorithm.id,
        }),
      )
    } catch {
      // The mutation keeps the backend error for the controls to display.
    }
  }, [
    algorithm.id,
    clearSolution,
    columns,
    resetSolve,
    rows,
    solvePuzzle,
    tiles,
  ])

  const moveTile = useCallback(
    (index: number) => {
      if (isGenerating || isSolving || result || playerSolved) return
      const empty = tiles.indexOf(0)
      if (!areAdjacent(index, empty, columns)) return
      const next = [...tiles]
      const selectedTile = next[index]
      const emptyTile = next[empty]
      if (selectedTile === undefined || emptyTile === undefined) return
      next[index] = emptyTile
      next[empty] = selectedTile
      setTiles(next)
      setPlayerMoves((current) => current + 1)
      resetSolve()
    },
    [columns, isGenerating, isSolving, playerSolved, resetSolve, result, tiles],
  )

  const resetBoard = useCallback(() => {
    setTiles(initialTiles)
    setPlayerMoves(0)
    clearSolution()
    resetSolve()
  }, [clearSolution, initialTiles, resetSolve])

  const selectAlgorithm = useCallback(
    (nextAlgorithmId: string) => {
      setAlgorithmId(nextAlgorithmId)
      clearSolution()
      resetSolve()
    },
    [clearSolution, resetSolve],
  )

  const changeRows = useCallback(
    (nextRows: number) => {
      setRows(nextRows)
      setTiles([])
      setInitialTiles([])
      setPlayerMoves(0)
      setGenerationSource(null)
      clearSolution()
      resetGeneration()
      resetSolve()
      void generateProblem({ rows: nextRows, columns })
    },
    [clearSolution, columns, generateProblem, resetGeneration, resetSolve],
  )

  const changeColumns = useCallback(
    (nextColumns: number) => {
      setColumns(nextColumns)
      setTiles([])
      setInitialTiles([])
      setPlayerMoves(0)
      setGenerationSource(null)
      clearSolution()
      resetGeneration()
      resetSolve()
      void generateProblem({ rows, columns: nextColumns })
    },
    [clearSolution, generateProblem, resetGeneration, resetSolve, rows],
  )

  const previousStep = useCallback(() => {
    setIsPlaying(false)
    setStep((current) => Math.max(0, current - 1))
  }, [])

  const nextStep = useCallback(() => {
    setIsPlaying(false)
    setStep((current) =>
      Math.min(result ? result.path.length - 1 : 0, current + 1),
    )
  }, [result])

  const togglePlayback = useCallback(() => {
    if (result && step === result.path.length - 1) setStep(0)
    setIsPlaying((current) => !current)
  }, [result, step])

  return {
    algorithm,
    algorithms,
    algorithmId,
    tiles,
    initialTiles,
    rows,
    columns,
    scramble,
    playerMoves,
    result,
    step,
    isPlaying,
    isGenerating,
    isSolving,
    generationSource,
    error,
    visibleTiles: result?.path[step] ?? tiles,
    currentMove: step > 0 ? result?.moves[step - 1] : undefined,
    playerSolved,
    isInteractive: !playerSolved && !result && !isGenerating && !isSolving,
    setScramble,
    changeRows,
    changeColumns,
    generateProblem,
    runAlgorithm,
    moveTile,
    resetBoard,
    selectAlgorithm,
    previousStep,
    nextStep,
    togglePlayback,
  }
}
