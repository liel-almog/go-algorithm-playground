import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/algorithms/karger')({
  beforeLoad: () => {
    throw redirect({ to: '/problems/minimum-cut', replace: true })
  },
})
