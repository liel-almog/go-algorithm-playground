interface ControlErrorProps {
  title: string
  message: string
}

export function ControlError({ title, message }: ControlErrorProps) {
  if (!message) return null

  return (
    <div
      role="alert"
      className="mt-3.5 rounded-md border border-[#e8cfc5] bg-[#fff4ef] p-[11px] text-xs leading-normal text-[#8b4d34]"
    >
      <strong className="block">{title}</strong>
      <span className="mt-[3px] block">{message}</span>
    </div>
  )
}
