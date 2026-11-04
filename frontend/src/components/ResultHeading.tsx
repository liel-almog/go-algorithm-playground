interface ResultHeadingProps {
  title: string
  complete: boolean
}

export function ResultHeading({ title, complete }: ResultHeadingProps) {
  return (
    <div className="flex flex-col justify-between border-r border-border p-[22px] max-[620px]:flex-row max-[620px]:border-r-0 max-[620px]:border-b">
      <div className="flex items-center gap-2.5">
        <span className="grid size-6 shrink-0 place-items-center rounded-full bg-[#e4ece3] font-mono text-xs text-primary">
          03
        </span>
        <strong className="text-[0.76rem]">{title}</strong>
      </div>
      {complete ? (
        <i className="self-start rounded bg-[#e5f0e8] px-[7px] py-[3px] text-xs not-italic text-[#2f7756]">
          complete
        </i>
      ) : null}
    </div>
  )
}
