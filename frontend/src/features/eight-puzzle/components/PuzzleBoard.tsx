import styles from '../eightPuzzle.module.css'
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
    <div
      className={`puzzle-board${playable ? ` ${styles.playable}` : ''}`}
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
          <button
            key={tile}
            type="button"
            className={
              tile === 0
                ? 'tile tile-empty'
                : movable
                  ? `tile ${styles.movable}`
                  : 'tile'
            }
            onClick={() => onTileClick(index)}
            disabled={!movable}
            aria-label={
              tile === 0
                ? 'Empty space'
                : movable
                  ? `Slide tile ${tile}`
                  : `Tile ${tile}`
            }
          >
            {tile === 0 ? <span className="sr-only">empty</span> : tile}
            {tile !== 0 && <small>{String.fromCharCode(64 + tile)}</small>}
          </button>
        )
      })}
    </div>
  )
}
