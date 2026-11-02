export function WorkflowSection() {
  const steps = [
    [
      'Set up the problem',
      'Generate an instance or provide the required input.',
    ],
    ['Solve or verify', 'Run a deterministic search or randomized test.'],
    ['Inspect', 'Replay the path, reveal the cut, or review sampled evidence.'],
  ]

  return (
    <section className="workflow-section section-wrap" id="workflow">
      <div className="workflow-copy">
        <span className="kicker">A repeatable method</span>
        <h2>A distinct workspace for every problem.</h2>
        <p>
          Some problems need a board, others a graph, matrices, equations, or
          inputs we have not added yet. Each lab adapts to the problem.
        </p>
      </div>
      <ol className="workflow-steps">
        {steps.map(([title, description], index) => (
          <li key={title}>
            <span>{String(index + 1).padStart(2, '0')}</span>
            <div>
              <strong>{title}</strong>
              <p>{description}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  )
}
