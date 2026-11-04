interface RequestErrorProps {
  error: Error | null
}

export function RequestError({ error }: RequestErrorProps) {
  if (!error) return null
  return (
    <p
      role="alert"
      className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm leading-relaxed text-destructive"
    >
      {error.message}
    </p>
  )
}
