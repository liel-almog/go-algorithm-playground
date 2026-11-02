interface PuzzleBoardProps {
  tiles: number[]
  move?: string | undefined
}

export function PuzzleBoard({ tiles, move }: PuzzleBoardProps) {
  return (
    <div
      className="puzzle-board"
      aria-label={`Puzzle board${move ? `, last move ${move}` : ''}`}
    >
      {tiles.map((tile) => (
        <div key={tile} className={tile === 0 ? 'tile tile-empty' : 'tile'}>
          {tile === 0 ? <span className="sr-only">empty</span> : tile}
          {tile !== 0 && <small>{String.fromCharCode(64 + tile)}</small>}
        </div>
      ))}
    </div>
  )
}
