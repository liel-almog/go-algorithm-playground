const nodes = [
  [35, 65],
  [85, 25],
  [85, 107],
  [120, 67],
  [160, 32],
  [165, 106],
  [205, 62],
]

export function GraphArt() {
  return (
    <svg
      className="w-[min(300px,90%)] overflow-visible"
      viewBox="0 0 240 130"
      aria-hidden="true"
    >
      <path
        className="fill-none stroke-[#73847a] stroke-2"
        d="M35 65L85 25M35 65l50 42M85 25l35 42m-35 40 35-40m0 0 40-35m-40 35 45 39m-5-74 45 30m-40 44 40-44"
      />
      {nodes.map(([x, y], index) => (
        <circle
          className="fill-white stroke-primary stroke-2 nth-of-type-[n+5]:fill-[#d8e9ed] nth-of-type-[n+5]:stroke-[#568393]"
          key={index}
          cx={x}
          cy={y}
          r="9"
        />
      ))}
    </svg>
  )
}
