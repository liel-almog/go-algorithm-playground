import type { ReactNode } from 'react'
import { cn } from '../../lib/utils'
import { Eyebrow } from '../Eyebrow'
import { PageSection } from '../PageLayout'

export interface ConceptExplainerProps {
  problem: string
  algorithmName: string
  algorithm: string
  steps: [string, string, string]
}

interface ExplanationProps {
  number: string
  title: string
  description: string
  solution?: boolean
  children?: ReactNode
}

function Explanation({
  number,
  title,
  description,
  solution = false,
  children,
}: ExplanationProps) {
  return (
    <div
      className={cn(
        'grid grid-cols-[32px_1fr] gap-4 px-[26px] py-6 max-[620px]:grid-cols-1 max-[620px]:p-[21px]',
        solution &&
          'border-l bg-[#f1f4ed] max-[900px]:border-t max-[900px]:border-l-0',
      )}
    >
      <span className="grid size-[30px] place-items-center rounded-full bg-primary font-mono text-xs leading-[normal] text-white">
        {number}
      </span>
      <div>
        <Eyebrow>{title}</Eyebrow>
        <p className="mt-2 text-xs leading-[1.7] text-muted-foreground">
          {description}
        </p>
        {children}
      </div>
    </div>
  )
}

export function ConceptExplainer({
  problem,
  algorithmName,
  algorithm,
  steps,
}: ConceptExplainerProps) {
  return (
    <PageSection
      className="mb-[22px] grid grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] overflow-hidden rounded-[9px] border bg-white/58 max-[900px]:grid-cols-1"
      aria-label="How it works"
    >
      <Explanation number="01" title="The problem" description={problem} />
      <Explanation
        number="02"
        title={`How ${algorithmName} solves it`}
        description={algorithm}
        solution
      >
        <ol className="mt-[17px] grid list-none grid-cols-3 gap-2.5 p-0 max-[620px]:grid-cols-1 max-[620px]:gap-3">
          {steps.map((step, index) => (
            <li key={step} className="text-xs leading-[1.45] text-[#556159]">
              <span className="mb-[5px] block font-mono font-medium text-orange max-[620px]:mr-[7px] max-[620px]:inline">
                {index + 1}
              </span>
              {step}
            </li>
          ))}
        </ol>
      </Explanation>
    </PageSection>
  )
}
