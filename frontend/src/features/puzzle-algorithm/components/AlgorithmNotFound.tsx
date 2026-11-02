import { Link } from '@tanstack/react-router'

export function AlgorithmNotFound() {
  return (
    <section className="empty-state section-wrap">
      <span>404</span>
      <h1>That algorithm is not in the lab.</h1>
      <p>The backend may know it, but this visualizer does not—yet.</p>
      <Link to="/" className="button button-primary">
        Back to all algorithms
      </Link>
    </section>
  )
}
