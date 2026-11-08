import { Link } from '@tanstack/react-router'
import type { Problem } from './problemCatalogData'
import { ProblemArt } from './ProblemArt'

interface ProblemCardProps {
  problem: Problem
}

const toneClasses = [
  'bg-[#eef0ea]',
  'bg-[#edf1f1]',
  'bg-[#f2eee8]',
  'bg-[#efedf1]',
]

export function ProblemCard({ problem }: ProblemCardProps) {
  return (
    <Link
      to={problem.to}
      className={`flex min-h-[520px] flex-col overflow-hidden rounded-[14px] border border-border p-7 transition-[transform,box-shadow] duration-200 hover:-translate-y-[5px] hover:shadow-[var(--shadow)] max-[680px]:min-h-[470px] ${toneClasses[problem.tone] ?? toneClasses[0]}`}
    >
      <div className="flex items-start justify-between gap-3 font-mono text-xs text-[#707970]">
        <span>{problem.number}</span>
        <div className="flex flex-wrap justify-end gap-2">
          {problem.apiInDevelopment && (
            <span className="rounded-full bg-[#f9e8d7] px-2 py-[5px] font-sans text-xs font-semibold text-[#8a4b1c]">
              API in development
            </span>
          )}
          <span className="rounded-full bg-white/55 px-2 py-[5px] font-sans text-xs font-semibold">
            {problem.type}
          </span>
        </div>
      </div>
      <div className="grid min-h-[205px] place-items-center">
        <ProblemArt kind={problem.art} />
      </div>
      <div>
        <small className="text-xs font-bold tracking-[0.14em] text-primary uppercase">
          {problem.family} · {problem.method}
        </small>
        <h2 className="mt-2 mb-[9px] text-[2rem] tracking-[-0.045em]">
          {problem.title}
        </h2>
        <p className="max-w-[430px] text-sm leading-[1.65] text-muted-foreground">
          {problem.description}
        </p>
      </div>
      <div className="mt-auto flex justify-between border-t border-[#cad0c8] pt-5 text-xs font-bold text-secondary-foreground">
        Open laboratory <span>↗</span>
      </div>
    </Link>
  )
}
