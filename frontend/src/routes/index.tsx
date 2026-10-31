import { Link, createFileRoute } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import type { ReactElement, ReactNode } from 'react'

export const Route = createFileRoute('/')({ component: Home })

type ProblemFamily = 'Search' | 'Graph' | 'Verification'

type Problem = {
  number: string
  title: string
  method: string
  type: string
  family: ProblemFamily
  description: string
  keywords: string
  art: ReactNode
  tone: number
  link: ReactElement
}

const problemCatalog: Problem[] = [
  {
    number: '01',
    title: 'The 8-puzzle',
    method: 'A* search',
    type: 'Deterministic',
    family: 'Search',
    description:
      'Search a state space and slide eight tiles into order with an optimal path.',
    keywords: 'astar heuristic sliding tiles state space shortest path',
    art: <PuzzleArt />,
    tone: 0,
    link: (
      <Link to="/algorithms/$algorithmId" params={{ algorithmId: 'astar' }} />
    ),
  },
  {
    number: '02',
    title: 'Minimum cut',
    method: "Karger's algorithm",
    type: 'Randomized',
    family: 'Graph',
    description:
      'Find the fewest edges that separate a graph into two disconnected groups.',
    keywords: 'karger graph cut edges contraction partition randomized',
    art: <GraphArt />,
    tone: 1,
    link: <Link to="/algorithms/karger" />,
  },
  {
    number: '03',
    title: 'Matrix multiplication',
    method: "Freivalds' algorithm",
    type: 'Monte Carlo',
    family: 'Verification',
    description:
      'Verify A × B = C in quadratic time without multiplying every entry again.',
    keywords: 'freivalds matrix product multiplication randomized equality',
    art: <MatrixArt />,
    tone: 2,
    link: <Link to="/problems/matrix-verification" />,
  },
  {
    number: '04',
    title: 'Polynomial identities',
    method: 'Schwartz–Zippel',
    type: 'Probabilistic',
    family: 'Verification',
    description:
      'Test whether two polynomials are identical by evaluating random field points.',
    keywords: 'schwartz zippel polynomial identity finite field evaluation',
    art: <PolynomialArt />,
    tone: 3,
    link: <Link to="/problems/polynomial-identity" />,
  },
]

const families = ['All', 'Search', 'Graph', 'Verification'] as const

function Home() {
  const [query, setQuery] = useState('')
  const [family, setFamily] = useState<(typeof families)[number]>('All')
  const visibleProblems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    return problemCatalog.filter((problem) => {
      const matchesFamily = family === 'All' || problem.family === family
      const searchableText = [
        problem.title,
        problem.method,
        problem.type,
        problem.family,
        problem.description,
        problem.keywords,
      ]
        .join(' ')
        .toLowerCase()
      return matchesFamily && searchableText.includes(normalizedQuery)
    })
  }, [family, query])

  return (
    <div className="home-page problem-home">
      <section className="problem-hero section-wrap">
        <div>
          <span className="eyebrow">
            <span className="eyebrow-dot" /> Interactive algorithm laboratory
          </span>
          <h1>
            Algorithms are easier
            <br />
            <em>when you can run them.</em>
          </h1>
        </div>
        <div className="hero-sidecopy">
          <p>
            Search a growing library of computational problems. Every problem
            has its own purpose-built workspace for generating, solving, and
            inspecting results.
          </p>
          <a href="#problems" className="button button-primary">
            Choose a problem <span>↓</span>
          </a>
        </div>
      </section>

      <section className="problem-index section-wrap" id="problems">
        <div className="problem-index-heading">
          <div>
            <span className="kicker">Problem library</span>
            <h2>Find something to solve.</h2>
          </div>
          <p>
            Search by problem, algorithm, or concept. New problem types can
            bring entirely new inputs, visualizations, and solving methods.
          </p>
        </div>
        <div className="catalog-tools">
          <label className="catalog-search">
            <span className="sr-only">Search problems</span>
            <i aria-hidden="true">⌕</i>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search problems, algorithms, or concepts…"
            />
            {query && (
              <button onClick={() => setQuery('')} aria-label="Clear search">
                ×
              </button>
            )}
          </label>
          <div className="catalog-filters" aria-label="Filter by problem type">
            {families.map((option) => (
              <button
                key={option}
                className={family === option ? 'active' : ''}
                onClick={() => setFamily(option)}
                aria-pressed={family === option}
              >
                {option}
              </button>
            ))}
          </div>
          <span className="catalog-count" aria-live="polite">
            {visibleProblems.length}{' '}
            {visibleProblems.length === 1 ? 'problem' : 'problems'}
          </span>
        </div>
        {visibleProblems.length > 0 ? (
          <div className="problem-card-grid">
            {visibleProblems.map((problem) => (
              <ProblemCard key={problem.number} problem={problem} />
            ))}
          </div>
        ) : (
          <div className="catalog-empty">
            <span>⌕</span>
            <h3>No matching problems</h3>
            <p>Try another term or show every category.</p>
            <button
              className="button button-secondary"
              onClick={() => {
                setQuery('')
                setFamily('All')
              }}
            >
              Clear filters
            </button>
          </div>
        )}
      </section>

      <section className="workflow-section section-wrap" id="workflow">
        <div className="workflow-copy">
          <span className="kicker">A repeatable method</span>
          <h2>A distinct workspace for every problem.</h2>
          <p>
            Some problems need a board, others a graph, matrices, equations, or
            inputs we have not added yet. Each lab adapts to the problem.
          </p>
        </div>
        <ol className="workflow-steps">
          <li>
            <span>01</span>
            <div>
              <strong>Set up the problem</strong>
              <p>Generate an instance or provide the required input.</p>
            </div>
          </li>
          <li>
            <span>02</span>
            <div>
              <strong>Solve or verify</strong>
              <p>Run a deterministic search or randomized test.</p>
            </div>
          </li>
          <li>
            <span>03</span>
            <div>
              <strong>Inspect</strong>
              <p>
                Replay the path, reveal the cut, or review sampled evidence.
              </p>
            </div>
          </li>
        </ol>
      </section>
    </div>
  )
}

function ProblemCard({ problem }: { problem: Problem }) {
  return (
    <Link
      {...problem.link.props}
      className={`problem-card problem-tone-${problem.tone}`}
    >
      <div className="problem-card-top">
        <span>{problem.number}</span>
        <i>{problem.type}</i>
      </div>
      <div className="problem-art">{problem.art}</div>
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

function PuzzleArt() {
  return (
    <div className="mini-puzzle">
      {[1, 2, 3, 4, 0, 5, 7, 8, 6].map((tile, index) => (
        <span key={index}>{tile || ''}</span>
      ))}
    </div>
  )
}

function GraphArt() {
  return (
    <svg viewBox="0 0 240 130" aria-hidden="true">
      <path d="M35 65L85 25M35 65l50 42M85 25l35 42m-35 40 35-40m0 0 40-35m-40 35 45 39m-5-74 45 30m-40 44 40-44" />
      {[
        [35, 65],
        [85, 25],
        [85, 107],
        [120, 67],
        [160, 32],
        [165, 106],
        [205, 62],
      ].map(([x, y], index) => (
        <circle key={index} cx={x} cy={y} r="9" />
      ))}
    </svg>
  )
}

function MatrixArt() {
  return (
    <div className="mini-matrix">
      <span>[ 2&nbsp; 1 ]</span>
      <b>×</b>
      <span>[ 3&nbsp; 0 ]</span>
      <b>=</b>
      <span>[ 7&nbsp; 2 ]</span>
    </div>
  )
}

function PolynomialArt() {
  return (
    <div className="mini-polynomial">
      <span>P(x)</span>
      <b>≟</b>
      <span>Q(x)</span>
      <small>evaluate at r</small>
    </div>
  )
}
