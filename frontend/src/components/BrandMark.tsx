export function BrandMark() {
  return (
    <span
      className="inline-grid rotate-[2deg] grid-cols-[repeat(2,8px)] gap-[2px]"
      aria-hidden="true"
    >
      <span className="size-2 rounded-[2px] bg-primary" />
      <span className="size-2 rounded-full bg-[var(--orange)]" />
      <span className="size-2 rounded-full bg-[var(--blue)]" />
      <span className="size-2 rounded-[2px] bg-accent" />
    </span>
  )
}
