import type { ReactNode } from 'react'

interface PanelHeadingProps {
  step: string
  title: ReactNode
  description: ReactNode
}

export function PanelHeading({ step, title, description }: PanelHeadingProps) {
  return (
    <div className="flex gap-3">
      <span className="grid size-6 shrink-0 place-items-center rounded-full bg-[#e4ece3] font-['DM_Mono'] text-[0.6rem] text-primary">
        {step}
      </span>
      <div>
        <strong className="text-[0.8rem]">{title}</strong>
        <p className="mt-[5px] text-[0.67rem] leading-normal text-muted-foreground">
          {description}
        </p>
      </div>
    </div>
  )
}
