import puzzleStyles from '../../../components/puzzle.module.css'

interface PuzzleBoardProps {
  tiles: number[]
  move?: string | undefined
}

export function PuzzleBoard({ tiles, move }: PuzzleBoardProps) {
  return (
    <div
      className={puzzleStyles['puzzle-board']}
      aria-label={`Puzzle board${move ? `, last move ${move}` : ''}`}
    >
      {tiles.map((tile) => (
        <div
          key={tile}
          className={
            tile === 0
              ? `${puzzleStyles.tile} ${puzzleStyles['tile-empty']}`
              : puzzleStyles.tile
          }
        >
          {tile === 0 ? <span className="sr-only">empty</span> : tile}
          {tile !== 0 && <small>{String.fromCharCode(64 + tile)}</small>}
        </div>
      ))}
    </div>
  )
}
