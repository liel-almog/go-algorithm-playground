import shellStyles from '../../../styles/shell.module.css'
import { useMemo, useState } from 'react'
import { ProblemCard } from './ProblemCard'
import { families, problems } from './problemCatalogData'
import type { ProblemFamilyFilter } from './problemCatalogData'
import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'

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
    <section
      className={`${shellStyles['section-wrap']} pt-[35px] pb-[120px]`}
      id="problems"
    >
      <div className="flex items-start justify-between border-t border-border pt-7 pb-8 max-[680px]:flex-col max-[680px]:gap-[15px]">
        <div>
          <span className={shellStyles['kicker']}>Problem library</span>
          <h2 className="mt-2 text-[clamp(1.8rem,3vw,2.8rem)] tracking-[-0.045em]">
            Find something to solve.
          </h2>
        </div>
        <p className="max-w-[390px] text-[0.76rem] leading-[1.7] text-muted-foreground">
          Search by problem, algorithm, or concept. New problem types can bring
          entirely new inputs, visualizations, and solving methods.
        </p>
      </div>
      <div className="mb-6 grid grid-cols-[minmax(280px,1fr)_auto_auto] items-center gap-[18px] max-[900px]:grid-cols-[1fr_auto] max-[680px]:grid-cols-1">
        <div className="flex min-h-[52px] items-center gap-3 rounded-[9px] border border-[#d4d9d2] bg-card px-4 shadow-[0_9px_26px_#1f2a230d] focus-within:border-[#7ba08c] focus-within:ring-3 focus-within:ring-ring/20 max-[900px]:col-span-full max-[680px]:col-span-1">
          <i
            aria-hidden="true"
            className="font-['DM_Mono'] text-xl text-primary"
          >
            ⌕
          </i>
          <Input
            className="h-auto flex-1 border-0 px-0 text-[0.78rem] shadow-none focus-visible:border-0 focus-visible:ring-0"
            type="search"
            aria-label="Search problems"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search problems, algorithms, or concepts…"
          />
          {query ? (
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={() => setQuery('')}
              aria-label="Clear search"
            >
              ×
            </Button>
          ) : null}
        </div>
        <div
          className="flex gap-[5px] overflow-x-auto rounded-[9px] border border-border bg-[#eeefe9] p-1"
          aria-label="Filter by problem type"
        >
          {families.map((option) => (
            <Button
              variant="ghost"
              key={option}
              className="min-h-[34px] rounded-md px-3 text-[0.65rem] font-bold text-[#727b74] aria-pressed:bg-card aria-pressed:text-secondary-foreground aria-pressed:shadow-[0_3px_12px_#273d3020]"
              onClick={() => setFamily(option)}
              aria-pressed={family === option}
            >
              {option}
            </Button>
          ))}
        </div>
        <span
          className="min-w-[68px] text-right font-['DM_Mono'] text-[0.6rem] text-[#858e87] max-[680px]:text-left"
          aria-live="polite"
        >
          {visibleProblems.length}{' '}
          {visibleProblems.length === 1 ? 'problem' : 'problems'}
        </span>
      </div>
      {visibleProblems.length ? (
        <div className="grid grid-cols-2 gap-4 max-[680px]:grid-cols-1">
          {visibleProblems.map((problem) => (
            <ProblemCard key={problem.number} problem={problem} />
          ))}
        </div>
      ) : (
        <div className="grid min-h-[370px] content-center justify-items-center rounded-[14px] border border-dashed border-[#cbd1c9] bg-[#f1f2ed] px-6 py-[50px] text-center">
          <span className="font-['DM_Mono'] text-[2rem] text-primary">⌕</span>
          <h3 className="mt-[14px] mb-[5px] text-[1.35rem]">
            No matching problems
          </h3>
          <p className="mb-5 text-[0.75rem] text-muted-foreground">
            Try another term or show every category.
          </p>
          <Button
            variant="secondary"
            className="min-h-12 px-5"
            onClick={clearFilters}
          >
            Clear filters
          </Button>
        </div>
      )}
    </section>
  )
}
