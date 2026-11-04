import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import {
  defaultPuzzleAlgorithm,
  findPuzzleAlgorithm,
} from '../../../lib/algorithms'
import { generateLocalPuzzle } from '../../../lib/clientAlgorithms'
import { errorMessage } from '../../../lib/errorMessage'
import { usePuzzleAlgorithms } from '../../algorithms/usePuzzleAlgorithms'
import { puzzleMutations } from '../mutations'
import { areAdjacent, isSolved } from '../puzzle'
import { usePuzzlePlayback } from './usePuzzlePlayback'
import { usePuzzleSolution } from './usePuzzleSolution'

export function useEightPuzzle() {
  const [algorithmId, setAlgorithmId] = useState('astar')
  const [tiles, setTiles] = useState(() => generateLocalPuzzle(3, 3, 18))
  const [initialTiles, setInitialTiles] = useState(tiles)
  const [rows, setRows] = useState(3)
  const [columns, setColumns] = useState(3)
  const [scramble, setScramble] = useState(18)
  const [playerMoves, setPlayerMoves] = useState(0)
  const [generationSource, setGenerationSource] = useState<'backend' | 'local'>(
    'local',
  )

  const algorithms = usePuzzleAlgorithms()
  const generation = useMutation(puzzleMutations.generate())
  const solution = usePuzzleSolution()
  const result = solution.data ?? null
  const playback = usePuzzlePlayback(result?.path.length ?? 0)
  const algorithm =
    findPuzzleAlgorithm(algorithmId, algorithms) ?? defaultPuzzleAlgorithm
  const playerSolved = isSolved(tiles, rows, columns)
  const isBusy = generation.isPending || solution.isPending
  const isInteractive = !playerSolved && !result && !isBusy

  const clearSolution = () => {
    solution.reset()
    playback.reset()
  }

  const setNewPuzzle = (nextTiles: number[]) => {
    setTiles(nextTiles)
    setInitialTiles(nextTiles)
    setPlayerMoves(0)
    clearSolution()
  }

  const generateProblem = () => {
    clearSolution()
    generation.mutate(
      { rows, columns, scramble },
      {
        onSuccess: (puzzle) => {
          setNewPuzzle(puzzle.tiles)
          setGenerationSource('backend')
        },
      },
    )
  }

  const runAlgorithm = () => {
    if (tiles.length === 0 || result || isBusy) return
    clearSolution()
    generation.reset()
    solution.mutate({ rows, columns, tiles, algorithm: algorithm.id })
  }

  const moveTile = (index: number) => {
    if (!isInteractive) return
    const emptyIndex = tiles.indexOf(0)
    if (!areAdjacent(index, emptyIndex, columns)) return
    const nextTiles = [...tiles]
    const selectedTile = nextTiles[index]
    const emptyTile = nextTiles[emptyIndex]
    if (selectedTile === undefined || emptyTile === undefined) return
    nextTiles[index] = emptyTile
    nextTiles[emptyIndex] = selectedTile
    setTiles(nextTiles)
    setPlayerMoves((current) => current + 1)
    solution.reset()
  }

  const resetBoard = () => {
    setTiles(initialTiles)
    setPlayerMoves(0)
    clearSolution()
  }

  const selectAlgorithm = (nextAlgorithmId: string) => {
    setAlgorithmId(nextAlgorithmId)
    clearSolution()
  }

  const changeDimensions = (nextRows: number, nextColumns: number) => {
    setRows(nextRows)
    setColumns(nextColumns)
    setNewPuzzle(generateLocalPuzzle(nextRows, nextColumns, scramble))
    setGenerationSource('local')
    generation.reset()
  }
  const changeRows = (value: number) => changeDimensions(value, columns)
  const changeColumns = (value: number) => changeDimensions(rows, value)

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
    generationSource,
    playerSolved,
    isInteractive,
    step: playback.step,
    isPlaying: playback.isPlaying,
    isGenerating: generation.isPending,
    isSolving: solution.isPending,
    error: errorMessage(solution.error ?? generation.error),
    visibleTiles: result?.path[playback.step] ?? tiles,
    currentMove:
      playback.step > 0 ? result?.moves[playback.step - 1] : undefined,
    setScramble,
    changeRows,
    changeColumns,
    generateProblem,
    runAlgorithm,
    moveTile,
    resetBoard,
    selectAlgorithm,
    previousStep: playback.previousStep,
    nextStep: playback.nextStep,
    togglePlayback: playback.togglePlayback,
  }
}
