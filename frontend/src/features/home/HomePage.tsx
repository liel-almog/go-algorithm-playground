import shellStyles from '../../styles/shell.module.css'
import { ProblemCatalog } from './components/ProblemCatalog'
import { WorkflowSection } from './components/WorkflowSection'
import { buttonVariants } from '../../components/ui/button'

export function HomePage() {
  return (
    <div>
      <section
        className={`${shellStyles['section-wrap']} grid min-h-[520px] grid-cols-[1.35fr_0.65fr] items-end gap-20 py-[96px] max-[900px]:min-h-0 max-[900px]:grid-cols-1 max-[900px]:gap-8 max-[680px]:py-[60px]`}
      >
        <div>
          <span className="flex items-center gap-[9px] text-[0.72rem] font-bold tracking-[0.15em] text-primary uppercase">
            <span className="size-[7px] rounded-full bg-[var(--orange)] shadow-[0_0_0_5px_#e3835520]" />{' '}
            Interactive algorithm laboratory
          </span>
          <h1 className="mt-6 max-w-[850px] text-[clamp(3.7rem,7vw,6.7rem)] leading-[0.93] font-semibold tracking-[-0.07em] max-[680px]:text-[3.6rem]">
            Algorithms are easier
            <br />
            <em className="font-['Playfair_Display'] font-semibold text-primary">
              when you can run them.
            </em>
          </h1>
        </div>
        <div className="pb-2 max-[900px]:max-w-[560px]">
          <p className="mb-7 text-[0.9rem] leading-[1.75] text-muted-foreground">
            Search a growing library of computational problems. Every problem
            has its own purpose-built workspace for generating, solving, and
            inspecting results.
          </p>
          <a
            href="#problems"
            className={buttonVariants({ className: 'min-h-12 px-5' })}
          >
            Choose a problem <span>↓</span>
          </a>
        </div>
      </section>
      <ProblemCatalog />
      <WorkflowSection />
    </div>
  )
}
