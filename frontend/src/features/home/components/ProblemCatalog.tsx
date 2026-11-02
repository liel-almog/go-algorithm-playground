import { useMemo, useState } from 'react'
import { ProblemCard } from './ProblemCard'
import { families, problems } from './problemCatalogData'
import type { ProblemFamilyFilter } from './problemCatalogData'

export function ProblemCatalog() {
  const [query, setQuery] = useState('')
  const [family, setFamily] = useState<ProblemFamilyFilter>('All')
  const visibleProblems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    return problems.filter((problem) => {
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

  const clearFilters = () => {
    setQuery('')
    setFamily('All')
  }

  return (
    <section className="problem-index section-wrap" id="problems">
      <div className="problem-index-heading">
        <div>
          <span className="kicker">Problem library</span>
          <h2>Find something to solve.</h2>
        </div>
        <p>
          Search by problem, algorithm, or concept. New problem types can bring
          entirely new inputs, visualizations, and solving methods.
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
          {query ? (
            <button onClick={() => setQuery('')} aria-label="Clear search">
              ×
            </button>
          ) : null}
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
      {visibleProblems.length ? (
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
          <button className="button button-secondary" onClick={clearFilters}>
            Clear filters
          </button>
        </div>
      )}
    </section>
  )
}
