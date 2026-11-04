import { PuzzleBoardFrame, PuzzleTile } from '../../../components/PuzzleBoard'

interface PuzzleBoardProps {
  tiles: number[]
  move?: string | undefined
}

export function PuzzleBoard({ tiles, move }: PuzzleBoardProps) {
  return (
    <PuzzleBoardFrame
      aria-label={`Puzzle board${move ? `, last move ${move}` : ''}`}
    >
      {tiles.map((tile) => (
        <PuzzleTile key={tile} tile={tile} />
      ))}
    </PuzzleBoardFrame>
  )
}
