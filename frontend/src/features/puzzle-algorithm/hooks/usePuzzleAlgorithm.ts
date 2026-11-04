import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import { findPuzzleAlgorithm } from '../../../lib/algorithms'
import { generateLocalPuzzle } from '../../../lib/clientAlgorithms'
import { errorMessage } from '../../../lib/errorMessage'
import { usePuzzleAlgorithms } from '../../algorithms/usePuzzleAlgorithms'
import { puzzleMutations } from '../../eight-puzzle/mutations'
import { usePuzzlePlayback } from '../../eight-puzzle/hooks/usePuzzlePlayback'
import { usePuzzleSolution } from '../../eight-puzzle/hooks/usePuzzleSolution'

export function usePuzzleAlgorithm(algorithmId: string) {
  const [tiles, setTiles] = useState(() => generateLocalPuzzle(3, 3, 18))
  const [scramble, setScramble] = useState(18)
  const algorithms = usePuzzleAlgorithms()
  const generation = useMutation(puzzleMutations.generate())
  const solution = usePuzzleSolution()
  const result = solution.data ?? null
  const playback = usePuzzlePlayback(result?.path.length ?? 0)
  const algorithm = findPuzzleAlgorithm(algorithmId, algorithms)

  const generateProblem = () => {
    solution.reset()
    playback.reset()
    generation.mutate(
      { rows: 3, columns: 3, scramble },
      { onSuccess: (puzzle) => setTiles(puzzle.tiles) },
    )
  }

  const runAlgorithm = () => {
    if (!algorithm || result || solution.isPending || generation.isPending)
      return
    generation.reset()
    playback.reset()
    solution.mutate({ rows: 3, columns: 3, tiles, algorithm: algorithm.id })
  }

  return {
    algorithm,
    tiles,
    scramble,
    result,
    step: playback.step,
    isPlaying: playback.isPlaying,
    error: errorMessage(solution.error ?? generation.error),
    isGenerating: generation.isPending,
    isSolving: solution.isPending,
    setScramble,
    generateProblem,
    runAlgorithm,
    previousStep: playback.previousStep,
    nextStep: playback.nextStep,
    togglePlayback: playback.togglePlayback,
  }
}
