import { PageSection } from '../../../components/PageLayout'
import { Eyebrow } from '../../../components/Eyebrow'

export function WorkflowSection() {
  const steps = [
    [
      'Set up the problem',
      'Generate an instance or provide the required input.',
    ],
    ['Solve or verify', 'Run a deterministic search or randomized test.'],
    ['Inspect', 'Replay the path, reveal the cut, or review sampled evidence.'],
  ]

  return (
    <PageSection
      className="grid grid-cols-[0.8fr_1.2fr] gap-[110px] border-t border-border pt-[100px] pb-[120px] max-[900px]:grid-cols-1 max-[900px]:gap-10 max-[620px]:py-[70px]"
      id="workflow"
    >
      <div>
        <Eyebrow>A repeatable method</Eyebrow>
        <h2 className="mt-2 text-[clamp(2rem,4vw,3rem)] leading-[1.1] tracking-[-0.045em]">
          A distinct workspace for every problem.
        </h2>
        <p className="max-w-[430px] text-[0.86rem] leading-[1.7] text-muted-foreground">
          Some problems need a board, others a graph, matrices, equations, or
          inputs we have not added yet. Each lab adapts to the problem.
        </p>
      </div>
      <ol className="m-0 list-none p-0">
        {steps.map(([title, description], index) => (
          <li
            key={title}
            className="flex gap-[26px] border-b border-border py-[25px]"
          >
            <span className="pt-1 font-mono text-xs text-orange">
              {String(index + 1).padStart(2, '0')}
            </span>
            <div>
              <strong className="text-[0.98rem]">{title}</strong>
              <p className="mt-[6px] text-sm text-muted-foreground">
                {description}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </PageSection>
  )
}
