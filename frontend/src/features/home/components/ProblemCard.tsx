import homeStyles from './problemArt.module.css'
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
      <div className="flex justify-between font-['DM_Mono'] text-[0.62rem] text-[#707970]">
        <span>{problem.number}</span>
        <i className="rounded-full bg-white/55 px-2 py-[5px] font-sans text-[0.56rem] font-semibold">
          {problem.type}
        </i>
      </div>
      <div
        className={`${homeStyles['problem-art']} grid min-h-[205px] place-items-center`}
      >
        <ProblemArt kind={problem.art} />
      </div>
      <div>
        <small className="text-[0.58rem] font-bold tracking-[0.14em] text-primary uppercase">
          {problem.family} · {problem.method}
        </small>
        <h2 className="mt-2 mb-[9px] text-[2rem] tracking-[-0.045em]">
          {problem.title}
        </h2>
        <p className="max-w-[430px] text-[0.77rem] leading-[1.65] text-muted-foreground">
          {problem.description}
        </p>
      </div>
      <div className="mt-auto flex justify-between border-t border-[#cad0c8] pt-5 text-[0.7rem] font-bold text-secondary-foreground">
        Open laboratory <span>↗</span>
      </div>
    </Link>
  )
}
