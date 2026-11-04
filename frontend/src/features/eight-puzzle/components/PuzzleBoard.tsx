import { PuzzleBoardFrame, PuzzleTile } from '../../../components/PuzzleBoard'
import { areAdjacent } from '../puzzle'

interface PuzzleBoardProps {
  tiles: number[]
  rows: number
  columns: number
  move?: string | undefined
  playable: boolean
  onTileClick: (index: number) => void
}

export function PuzzleBoard({
  tiles,
  rows,
  columns,
  move,
  playable,
  onTileClick,
}: PuzzleBoardProps) {
  const empty = tiles.indexOf(0)

  return (
    <PuzzleBoardFrame
      style={{
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        aspectRatio: `${columns} / ${rows}`,
      }}
      aria-label={`Puzzle board${move ? `, last move ${move}` : ''}`}
    >
      {tiles.map((tile, index) => {
        const movable =
          playable && tile !== 0 && areAdjacent(index, empty, columns)
        return (
          <PuzzleTile
            key={tile}
            tile={tile}
            playable={playable}
            movable={movable}
            onClick={() => onTileClick(index)}
          />
        )
      })}
    </PuzzleBoardFrame>
  )
}
