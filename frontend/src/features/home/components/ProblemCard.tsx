import { Link } from '@tanstack/react-router'
import type { Problem } from './problemCatalogData'
import { ProblemArt } from './ProblemArt'

interface ProblemCardProps {
  problem: Problem
}

export function ProblemCard({ problem }: ProblemCardProps) {
  return (
    <Link
      to={problem.to}
      className={`problem-card problem-tone-${problem.tone}`}
    >
      <div className="problem-card-top">
        <span>{problem.number}</span>
        <i>{problem.type}</i>
      </div>
      <div className="problem-art">
        <ProblemArt kind={problem.art} />
      </div>
      <div className="problem-card-copy">
        <small>
          {problem.family} · {problem.method}
        </small>
        <h2>{problem.title}</h2>
        <p>{problem.description}</p>
      </div>
      <div className="problem-card-link">
        Open laboratory <span>↗</span>
      </div>
    </Link>
  )
}
