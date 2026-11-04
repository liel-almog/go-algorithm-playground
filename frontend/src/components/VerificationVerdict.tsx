import type { ReactNode } from 'react'
import labStyles from './lab.module.css'
import verifierStyles from './verifier.module.css'
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
  const title = !hasResult
    ? idleTitle
    : accepted
      ? acceptedTitle
      : rejectedTitle
  const description = !hasResult
    ? idleDescription
    : accepted
      ? acceptedDescription
      : rejectedDescription

  return (
    <section
      className={`${labStyles['metrics-panel']} ${verifierStyles['verifier-result']}`}
      aria-label={ariaLabel}
    >
      <ResultHeading title="Read the verdict" complete={hasResult} />
      <div className={verifierStyles['verdict-copy']}>
        <span
          className={`${verifierStyles['verdict-icon']} ${hasResult ? (accepted ? verifierStyles.accepted : verifierStyles.rejected) : ''}`}
        >
          {!hasResult ? '?' : accepted ? '✓' : '×'}
        </span>
        <div>
          <strong>{title}</strong>
          <p>{description}</p>
        </div>
      </div>
    </section>
  )
}
