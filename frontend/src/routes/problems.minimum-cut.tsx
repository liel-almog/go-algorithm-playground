import { createFileRoute } from '@tanstack/react-router'
import { MinCutPage } from '../features/min-cut/MinCutPage'

export const Route = createFileRoute('/problems/minimum-cut')({
  component: MinCutPage,
})
