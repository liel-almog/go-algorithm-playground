import type { ComponentProps } from 'react'
import { cva } from 'class-variance-authority'
import { cn } from '../lib/utils'

export function PuzzleBoardFrame({
  className,
  ...props
}: ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'grid aspect-square w-[min(310px,76vw)] grid-cols-3 gap-[7px] rounded-xl bg-[#284838] p-3 shadow-[0_20px_38px_#1a382a2c,inset_0_0_0_1px_#ffffff1b]',
        className,
      )}
      {...props}
    />
  )
}

const tileVariants = cva(
  'relative grid min-w-0 place-items-center rounded-[7px] border-0 p-0 font-mono text-[1.55rem] leading-[normal] font-semibold text-secondary-foreground disabled:opacity-100',
  {
    variants: {
      state: {
        empty: 'animate-tile-in bg-[#1d3a2c] shadow-[inset_0_0_18px_#10281d]',
        static:
          'animate-tile-in bg-linear-[145deg,#fff,#edf0e9] shadow-[inset_0_0_0_1px_#fff,0_3px_6px_#132a202a]',
        playable: [
          'bg-[#f4f6f1] shadow-[inset_0_0_0_1px_#fff,0_3px_6px_#132a202a]',
          'transition-[background-color,box-shadow,transform] duration-180 ease-[ease] motion-reduce:transition-none',
        ],
        movable: [
          'cursor-pointer bg-[#fff0d8] shadow-[inset_0_0_0_2px_#c8783e,0_3px_0_#ad6535,0_6px_12px_#132a2028]',
          'transition-[background-color,box-shadow,transform] duration-180 ease-[ease] motion-reduce:transition-none',
          'hover:-translate-y-0.5 hover:bg-[#ffead0] hover:shadow-[inset_0_0_0_2px_#c8783e,0_5px_0_#ad6535,0_10px_16px_#132a2030]',
          'active:translate-y-px active:shadow-[inset_0_0_0_2px_#c8783e,0_1px_0_#ad6535,0_2px_5px_#132a2026]',
          'focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-primary',
        ],
      },
    },
  },
)

interface PuzzleTileProps {
  tile: number
  playable?: boolean
  movable?: boolean
  onClick?: () => void
}

function getTileState(tile: number, playable: boolean, movable: boolean) {
  if (tile === 0) return 'empty'
  if (movable) return 'movable'
  return playable ? 'playable' : 'static'
}

export function PuzzleTile({
  tile,
  playable = false,
  movable = false,
  onClick,
}: PuzzleTileProps) {
  const empty = tile === 0
  const className = tileVariants({
    state: getTileState(tile, playable, movable),
  })
  const content = (
    <>
      {empty ? <span className="sr-only">empty</span> : tile}
      {!empty && (
        <small className="absolute right-2 bottom-1.5 font-sans text-xs leading-[normal] font-normal text-[#afb7af]">
          {String.fromCharCode(64 + tile)}
        </small>
      )}
    </>
  )

  if (!onClick) return <div className={className}>{content}</div>

  return (
    <button
      type="button"
      className={className}
      onClick={onClick}
      disabled={!movable}
      data-tile={empty ? undefined : tile}
      aria-label={
        empty ? 'Empty space' : movable ? `Slide tile ${tile}` : `Tile ${tile}`
      }
    >
      {content}
    </button>
  )
}
