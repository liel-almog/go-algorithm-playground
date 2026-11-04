import { PageSection } from '../../components/PageLayout'
import { ProblemCatalog } from './components/ProblemCatalog'
import { WorkflowSection } from './components/WorkflowSection'
import { buttonVariants } from '../../components/ui/button'

export function HomePage() {
  return (
    <div>
      <PageSection className="grid min-h-[520px] grid-cols-[minmax(0,1.35fr)_minmax(0,0.65fr)] items-end gap-12 py-[96px] max-[1100px]:min-h-0 max-[1100px]:grid-cols-1 max-[1100px]:gap-8 max-[680px]:py-[60px]">
        <div>
          <span className="flex items-center gap-[9px] text-xs font-bold tracking-[0.15em] text-primary uppercase">
            <span className="size-[7px] rounded-full bg-orange shadow-[0_0_0_5px_#e3835520]" />{' '}
            Interactive algorithm laboratory
          </span>
          <h1 className="mt-6 max-w-[850px] text-[clamp(3rem,7vw,6.7rem)] leading-[0.98] font-semibold tracking-[-0.065em] max-[680px]:text-[clamp(2.7rem,10vw,3.6rem)]">
            Algorithms are easier
            <br className="max-[1100px]:hidden" />{' '}
            <em className="font-['Playfair_Display'] font-semibold text-primary">
              when you can run them.
            </em>
          </h1>
        </div>
        <div className="pb-2 max-[1100px]:max-w-[560px]">
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
      </PageSection>
      <ProblemCatalog />
      <WorkflowSection />
    </div>
  )
}
