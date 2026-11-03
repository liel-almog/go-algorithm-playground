import puzzleStyles from '../../../components/puzzle.module.css'
import shellStyles from '../../../styles/shell.module.css'
import { Link } from '@tanstack/react-router'
import { buttonVariants } from '../../../components/ui/button'

export function AlgorithmNotFound() {
  return (
    <section
      className={`${puzzleStyles['empty-state']} ${shellStyles['section-wrap']}`}
    >
      <span>404</span>
      <h1>That algorithm is not in the lab.</h1>
      <p>The backend may know it, but this visualizer does not—yet.</p>
      <Link to="/" className={buttonVariants({ className: 'min-h-12 px-5' })}>
        Back to all algorithms
      </Link>
    </section>
  )
}
