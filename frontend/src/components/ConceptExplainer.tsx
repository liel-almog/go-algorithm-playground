type ConceptExplainerProps = {
  problem: string
  algorithmName: string
  algorithm: string
  steps: [string, string, string]
}

export function ConceptExplainer({
  problem,
  algorithmName,
  algorithm,
  steps,
}: ConceptExplainerProps) {
  return (
    <section
      className="concept-explainer section-wrap"
      aria-label="How it works"
    >
      <div className="concept-copy">
        <span className="concept-number">01</span>
        <div>
          <span className="kicker">The problem</span>
          <p>{problem}</p>
        </div>
      </div>
      <div className="concept-copy concept-solution">
        <span className="concept-number">02</span>
        <div>
          <span className="kicker">How {algorithmName} solves it</span>
          <p>{algorithm}</p>
          <ol className="concept-steps">
            {steps.map((step, index) => (
              <li key={step}>
                <span>{index + 1}</span>
                {step}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
