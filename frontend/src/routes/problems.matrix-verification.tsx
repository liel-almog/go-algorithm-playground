import { createFileRoute } from '@tanstack/react-router'
import { MatrixVerificationPage } from '../features/matrix-verification/MatrixVerificationPage'

export const Route = createFileRoute('/problems/matrix-verification')({
  component: MatrixVerificationPage,
})
