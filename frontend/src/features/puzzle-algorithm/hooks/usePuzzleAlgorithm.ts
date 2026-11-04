import { useMutation, useQuery } from '@tanstack/react-query'
import { useRouter } from '@tanstack/react-router'
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
import { puzzleQueries } from '../../eight-puzzle/queries'
import { errorMessage } from '../puzzleAlgorithm'

export function usePuzzleAlgorithm(algorithmId: string) {
  const { queryClient } = useRouter().options.context
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
  const [isSolving, setIsSolving] = useState(false)
  const [solveError, setSolveError] = useState<unknown>(null)
  const error = solveError ? errorMessage(solveError) : ''

  const generateProblem = useCallback(async () => {
    generation.reset()
    setSolveError(null)
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
  }, [generation, scramble])

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
    if (!algorithm || tiles.length === 0 || result || isSolving) return
    const solveQuery = puzzleQueries.solve(3, 3, tiles, algorithm.id)
    setSolveError(null)
    setResult(null)
    setStep(0)
    setIsPlaying(false)
    const cachedResult = queryClient.getQueryData(solveQuery.queryKey)
    if (cachedResult) {
      setResult(cachedResult)
      return
    }
    setIsSolving(true)
    try {
      setResult(await queryClient.fetchQuery(solveQuery))
    } catch (reason) {
      setSolveError(reason)
    } finally {
      setIsSolving(false)
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
    isSolving,
    setScramble,
    setStep,
    setIsPlaying,
    generateProblem,
    runAlgorithm,
  }
}
