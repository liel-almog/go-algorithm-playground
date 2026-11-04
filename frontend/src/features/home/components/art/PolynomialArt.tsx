export function PolynomialArt() {
  return (
    <div className="relative flex items-center gap-[26px]">
      <span className="rounded-full bg-white p-[22px] font-mono text-[1.15rem] leading-[normal] font-medium text-[#6f5360] shadow-[0_12px_25px_#51364614]">
        P(x)
      </span>
      <b className="text-2xl text-orange">≟</b>
      <span className="rounded-full bg-white p-[22px] font-mono text-[1.15rem] leading-[normal] font-medium text-[#6f5360] shadow-[0_12px_25px_#51364614]">
        Q(x)
      </span>
      <small className="absolute top-[calc(100%+12px)] left-1/2 -translate-x-1/2 font-mono text-[0.55rem] leading-[normal] whitespace-nowrap text-[#8d7e86]">
        evaluate at r
      </small>
    </div>
  )
}
