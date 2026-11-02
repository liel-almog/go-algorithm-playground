import styles from './ConceptExplainer.module.css'

export interface ConceptExplainerProps {
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
      className={`${styles.explainer} section-wrap`}
      aria-label="How it works"
    >
      <div className={styles.copy}>
        <span className={styles.number}>01</span>
        <div>
          <span className="kicker">The problem</span>
          <p>{problem}</p>
        </div>
      </div>
      <div className={`${styles.copy} ${styles.solution}`}>
        <span className={styles.number}>02</span>
        <div>
          <span className="kicker">How {algorithmName} solves it</span>
          <p>{algorithm}</p>
          <ol className={styles.steps}>
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
