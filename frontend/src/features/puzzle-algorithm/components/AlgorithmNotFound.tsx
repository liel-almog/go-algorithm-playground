import { PageSection } from '../../../components/PageLayout'
import { Link } from '@tanstack/react-router'
import { buttonVariants } from '../../../components/ui/button'

export function AlgorithmNotFound() {
  return (
    <PageSection className="py-[120px] text-center">
      <span className="font-mono text-base text-orange">404</span>
      <h1 className="mt-4 mb-2 text-5xl tracking-[-0.05em]">
        That algorithm is not in the lab.
      </h1>
      <p className="mb-[30px] text-muted-foreground">
        The backend may know it, but this visualizer does not—yet.
      </p>
      <Link to="/" className={buttonVariants({ className: 'min-h-12 px-5' })}>
        Back to all algorithms
      </Link>
    </PageSection>
  )
}
