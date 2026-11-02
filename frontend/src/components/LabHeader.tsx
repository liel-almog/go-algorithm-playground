import { Link } from '@tanstack/react-router'

interface LabHeaderProps {
  eyebrow: string
  title: string
  description: string
  badge: string
}

export function LabHeader({
  eyebrow,
  title,
  description,
  badge,
}: LabHeaderProps) {
  return (
    <section className="lab-header section-wrap">
      <Link to="/" className="back-link">
        ← All problems
      </Link>
      <div className="lab-title-row">
        <div>
          <span className="kicker">{eyebrow}</span>
          <h1>{title}</h1>
          <p>{description}</p>
        </div>
        <span className="lab-badge">◇ {badge}</span>
      </div>
    </section>
  )
}
