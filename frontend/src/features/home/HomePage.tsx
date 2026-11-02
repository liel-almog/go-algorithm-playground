import { ProblemCatalog } from './components/ProblemCatalog'
import { WorkflowSection } from './components/WorkflowSection'

export function HomePage() {
  return (
    <div className="home-page problem-home">
      <section className="problem-hero section-wrap">
        <div>
          <span className="eyebrow">
            <span className="eyebrow-dot" /> Interactive algorithm laboratory
          </span>
          <h1>
            Algorithms are easier
            <br />
            <em>when you can run them.</em>
          </h1>
        </div>
        <div className="hero-sidecopy">
          <p>
            Search a growing library of computational problems. Every problem
            has its own purpose-built workspace for generating, solving, and
            inspecting results.
          </p>
          <a href="#problems" className="button button-primary">
            Choose a problem <span>↓</span>
          </a>
        </div>
      </section>
      <ProblemCatalog />
      <WorkflowSection />
    </div>
  )
}
