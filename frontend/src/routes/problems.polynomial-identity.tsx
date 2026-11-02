import { createFileRoute } from '@tanstack/react-router'
import { PolynomialIdentityPage } from '../features/polynomial-identity/PolynomialIdentityPage'

export const Route = createFileRoute('/problems/polynomial-identity')({
  component: PolynomialIdentityPage,
})
