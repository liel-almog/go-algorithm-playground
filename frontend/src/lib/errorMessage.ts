export function errorMessage(reason: unknown) {
  if (reason == null) return ''
  return reason instanceof Error
    ? reason.message
    : 'The backend did not respond.'
}
