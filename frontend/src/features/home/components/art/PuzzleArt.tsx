const tiles = [1, 2, 3, 4, 0, 5, 7, 8, 6]

export function PuzzleArt() {
  return (
    <div className="grid w-40 -rotate-3 grid-cols-3 gap-[5px] rounded-[9px] bg-secondary-foreground p-1.5 shadow-[0_18px_30px_#233c3028]">
      {tiles.map((tile, index) => (
        <span
          className="grid aspect-square place-items-center rounded-[5px] bg-white font-mono text-[0.85rem] leading-[normal] font-medium text-secondary-foreground nth-5:bg-[#1b3b2c]"
          key={index}
        >
          {tile || ''}
        </span>
      ))}
    </div>
  )
}
