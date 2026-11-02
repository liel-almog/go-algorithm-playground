export function formatDuration(microseconds: number) {
  if (microseconds < 1000) return `${microseconds} μs`
  if (microseconds < 1_000_000) return `${(microseconds / 1000).toFixed(1)} ms`
  return `${(microseconds / 1_000_000).toFixed(2)} s`
}

export function errorMessage(reason: unknown) {
  return reason instanceof Error
    ? reason.message
    : 'The backend did not respond.'
}
