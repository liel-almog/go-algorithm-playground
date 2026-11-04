import type { ReactNode } from 'react'
import { DottedSurface } from './LabPanels'

interface PuzzleStageProps {
  lastTile: number
  children: ReactNode
}

export function PuzzleStage({ lastTile, children }: PuzzleStageProps) {
  return (
    <DottedSurface className="relative grid min-h-[400px] place-items-center max-[620px]:min-h-[350px] max-[620px]:px-3 max-[620px]:pt-4.5 max-[620px]:pb-[38px]">
      {children}
      <div className="absolute right-5 bottom-4 flex items-center gap-[7px] text-xs text-[#899189] max-[620px]:right-3 max-[620px]:bottom-2.5 max-[620px]:left-3 max-[620px]:justify-center max-[620px]:text-center">
        <span className="size-[9px] rounded-[2px] bg-[#1d3a2c]" />
        Goal: arrange 1–{lastTile} with the empty space last
      </div>
    </DottedSurface>
  )
}

export function PuzzleSkeleton() {
  return (
    <div
      className="aspect-square w-[min(310px,76vw)] animate-shimmer rounded-xl bg-linear-[100deg,#e4e7e1_20%,#f2f3ef_38%,#e4e7e1_55%] bg-size-[200%_100%]"
      aria-label="Loading puzzle"
    />
  )
}
