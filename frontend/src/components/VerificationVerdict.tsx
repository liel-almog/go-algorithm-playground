import { ResultHeading } from './ResultHeading'

interface VerificationVerdictProps {
  ariaLabel: string
  hasResult: boolean
  accepted: boolean
  idleTitle: string
  acceptedTitle: string
  rejectedTitle: string
  idleDescription: string
  acceptedDescription: string
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
    <section className="metrics-panel verifier-result" aria-label={ariaLabel}>
      <ResultHeading title="Read the verdict" complete={hasResult} />
      <div className="verdict-copy">
        <span
          className={`verdict-icon ${hasResult ? (accepted ? 'accepted' : 'rejected') : ''}`}
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
