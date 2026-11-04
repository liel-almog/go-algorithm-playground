import type { ReactNode } from 'react'
import { cn } from '../lib/utils'
import { ResultsPanel } from './LabPanels'
import { ResultHeading } from './ResultHeading'

interface VerificationVerdictProps {
  ariaLabel: string
  hasResult: boolean
  accepted: boolean
  idleTitle: string
  acceptedTitle: string
  rejectedTitle: string
  idleDescription: string
  acceptedDescription: ReactNode
  rejectedDescription: string
}

export function VerificationVerdict({
  ariaLabel,
  hasResult,
  accepted,
  idleTitle,
  acceptedTitle,
  rejectedTitle,
  idleDescription,
  acceptedDescription,
  rejectedDescription,
}: VerificationVerdictProps) {
  const state = getVerdictState(hasResult, accepted)
  const verdict = {
    idle: {
      title: idleTitle,
      description: idleDescription,
      icon: '?',
      className: 'bg-[#eceee9] text-[#9aa09a]',
    },
    accepted: {
      title: acceptedTitle,
      description: acceptedDescription,
      icon: '✓',
      className: 'bg-[#dff0e4] text-primary',
    },
    rejected: {
      title: rejectedTitle,
      description: rejectedDescription,
      icon: '×',
      className: 'bg-[#f6ddd3] text-[#a24f33]',
    },
  }[state]

  return (
    <ResultsPanel aria-label={ariaLabel} aria-live="polite">
      <ResultHeading title="Read the verdict" complete={hasResult} />
      <div className="flex min-h-28 items-center gap-4 px-[26px] py-4.5">
        <span
          className={cn(
            'grid size-12 shrink-0 place-items-center rounded-full font-mono text-[1.1rem] leading-[normal]',
            verdict.className,
          )}
        >
          {verdict.icon}
        </span>
        <div>
          <strong className="text-[0.82rem]">{verdict.title}</strong>
          <p className="mt-[5px] text-sm leading-normal text-muted-foreground">
            {verdict.description}
          </p>
        </div>
      </div>
    </ResultsPanel>
  )
}

function getVerdictState(hasResult: boolean, accepted: boolean) {
  if (!hasResult) return 'idle'
  return accepted ? 'accepted' : 'rejected'
}
