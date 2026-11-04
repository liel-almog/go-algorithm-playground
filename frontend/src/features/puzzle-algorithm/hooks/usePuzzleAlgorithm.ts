import { useMutation, useQuery } from '@tanstack/react-query'
import { useCallback, useEffect, useRef, useState } from 'react'
import {
  fallbackAlgorithmCatalog,
  findPuzzleAlgorithm,
  isPuzzleAlgorithm,
  puzzleAlgorithms as fallbackPuzzleAlgorithms,
} from '../../../lib/algorithms'
import type { SolveResult } from '../../../lib/api'
import { generateLocalPuzzle } from '../../../lib/clientAlgorithms'
import { algorithmQueries } from '../../algorithms/queries'
import { puzzleMutations } from '../../eight-puzzle/mutations'
import { errorMessage } from '../puzzleAlgorithm'

export function usePuzzleAlgorithm(algorithmId: string) {
  const { data: serverAlgorithms } = useQuery({
    ...algorithmQueries.catalog(),
    placeholderData: fallbackAlgorithmCatalog,
    select: (catalog) => catalog.algorithms.filter(isPuzzleAlgorithm),
  })
  const algorithms = serverAlgorithms?.length
    ? serverAlgorithms
    : fallbackPuzzleAlgorithms
  const algorithm = findPuzzleAlgorithm(algorithmId, algorithms)
  const [tiles, setTiles] = useState<number[]>([])
  const [scramble, setScramble] = useState(18)
  const [result, setResult] = useState<SolveResult | null>(null)
  const [step, setStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const generatedFor = useRef('')
  const generation = useMutation(puzzleMutations.generate())
  const solver = useMutation(puzzleMutations.solve())
  const error = solver.error ? errorMessage(solver.error) : ''

  const generateProblem = useCallback(async () => {
    generation.reset()
    solver.reset()
    setResult(null)
    setStep(0)
    setIsPlaying(false)
    try {
      const puzzle = await generation.mutateAsync({
        rows: 3,
        columns: 3,
        scramble,
      })
      setTiles(puzzle.tiles)
    } catch {
      setTiles(generateLocalPuzzle(3, 3, scramble))
      generation.reset()
    }
  }, [generation, scramble, solver])

  useEffect(() => {
    if (algorithm && generatedFor.current !== algorithmId) {
      generatedFor.current = algorithmId
      void generateProblem()
    }
  }, [algorithmId, algorithm, generateProblem])

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

  const runAlgorithm = async () => {
    if (!algorithm || tiles.length === 0) return
    solver.reset()
    setResult(null)
    setStep(0)
    try {
      setResult(
        await solver.mutateAsync({
          rows: 3,
          columns: 3,
          tiles,
          algorithm: algorithm.id,
        }),
      )
    } catch {
      // The mutation keeps the backend error for the controls to display.
    }
  }

  return {
    algorithm,
    tiles,
    scramble,
    result,
    step,
    isPlaying,
    error,
    isGenerating: generation.isPending,
    isSolving: solver.isPending,
    setScramble,
    setStep,
    setIsPlaying,
    generateProblem,
    runAlgorithm,
  }
}
