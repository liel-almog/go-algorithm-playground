import homeStyles from '../problemArt.module.css'

const tiles = [1, 2, 3, 4, 0, 5, 7, 8, 6]

export function PuzzleArt() {
  return (
    <div className={homeStyles['mini-puzzle']}>
      {tiles.map((tile, index) => (
        <span key={index}>{tile || ''}</span>
      ))}
    </div>
  )
}
