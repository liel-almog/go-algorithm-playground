interface ResultHeadingProps {
  title: string
  complete: boolean
}

export function ResultHeading({ title, complete }: ResultHeadingProps) {
  return (
    <div className="metrics-heading">
      <div>
        <span>03</span>
        <strong>{title}</strong>
      </div>
      {complete ? <i>complete</i> : null}
    </div>
  )
}
