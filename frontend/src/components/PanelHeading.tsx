import type { ReactNode } from 'react'

interface PanelHeadingProps {
  step: string
  title: ReactNode
  description: ReactNode
}

export function PanelHeading({ step, title, description }: PanelHeadingProps) {
  return (
    <div className="panel-heading">
      <span>{step}</span>
      <div>
        <strong>{title}</strong>
        <p>{description}</p>
      </div>
    </div>
  )
}
