import { Tooltip } from '@base-ui/react/tooltip'
import { Info } from 'lucide-react'

interface ErrorProbabilityNoteProps {
  rounds: number
  probability: string
}

const badgeClassName =
  'inline-flex max-w-full items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-left text-xs font-medium text-amber-900'

export function ErrorProbabilityNote({
  rounds,
  probability,
}: ErrorProbabilityNoteProps) {
  if (100 / 2 ** rounds >= 1) {
    return (
      <span className={badgeClassName}>
        Error chance ≤ <span className="font-mono">{probability}</span>
      </span>
    )
  }

  return (
    <Tooltip.Provider delay={150}>
      <Tooltip.Root>
        <Tooltip.Trigger
          className={`${badgeClassName} cursor-help transition-colors hover:bg-amber-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary`}
        >
          Small chance of error
          <Info aria-hidden="true" className="size-3.5 shrink-0 opacity-70" />
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Positioner side="top" sideOffset={6} className="z-50">
            <Tooltip.Popup className="max-w-[calc(100vw-2rem)] rounded-md bg-foreground px-3 py-2 text-xs text-background shadow-md">
              Error chance ≤{' '}
              <span className="font-mono font-medium">{probability}</span>
            </Tooltip.Popup>
          </Tooltip.Positioner>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  )
}
