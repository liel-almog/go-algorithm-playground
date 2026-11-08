export function MatrixArt() {
  return (
    <div className="flex items-center gap-1 font-mono text-[0.68rem] leading-[normal] text-[#6f675c] min-[900px]:gap-3 min-[900px]:text-[0.78rem]">
      <span className="whitespace-nowrap border-x-2 border-[#8f8578] bg-white/60 px-1.5 py-4 min-[900px]:px-3 min-[900px]:py-5">
        [2&nbsp;1]
      </span>
      <b className="text-base text-orange min-[900px]:text-[1.2rem]">×</b>
      <span className="whitespace-nowrap border-x-2 border-[#8f8578] bg-white/60 px-1.5 py-4 min-[900px]:px-3 min-[900px]:py-5">
        [3&nbsp;0]
      </span>
      <b className="text-base text-orange min-[900px]:text-[1.2rem]">=</b>
      <span className="whitespace-nowrap border-x-2 border-[#8f8578] bg-white/60 px-1.5 py-4 min-[900px]:px-3 min-[900px]:py-5">
        [7&nbsp;2]
      </span>
    </div>
  )
}
