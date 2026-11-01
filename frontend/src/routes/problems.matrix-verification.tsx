import { createFileRoute } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import { LabHeader } from './algorithms.$algorithmId'
import { ConceptExplainer } from '../components/ConceptExplainer'

export const Route = createFileRoute('/problems/matrix-verification')({
  component: MatrixVerificationPage,
})

type Matrix = number[][]
type Trial = {
  vector: number[]
  left: number[]
  right: number[]
  passed: boolean
}

function MatrixVerificationPage() {
  const [size, setSize] = useState(3)
  const [rounds, setRounds] = useState(5)
  const [problem, setProblem] = useState(() => generateProblem(3))
  const [trials, setTrials] = useState<Trial[]>([])
  const [tampered, setTampered] = useState(false)

  const regenerate = () => {
    setProblem(generateProblem(size))
    setTrials([])
    setTampered(false)
  }

  const toggleTamper = () => {
    setProblem((current) => {
      const product = current.product.map((row) => [...row])
      if (tampered) product[0][0] -= 1
      else product[0][0] += 1
      return { ...current, product }
    })
    setTampered((current) => !current)
    setTrials([])
  }

  const verify = () => {
    const nextTrials = Array.from({ length: rounds }, () => {
      const vector = Array.from({ length: size }, () =>
        Math.random() < 0.5 ? 0 : 1,
      )
      const right = multiplyVector(problem.product, vector)
      const left = multiplyVector(problem.a, multiplyVector(problem.b, vector))
      return {
        vector,
        left,
        right,
        passed: left.every((value, index) => value === right[index]),
      }
    })
    setTrials(nextTrials)
  }

  const accepted = trials.length > 0 && trials.every((trial) => trial.passed)
  const failureProbability = useMemo(
    () => `${(100 / 2 ** rounds).toFixed(rounds > 6 ? 2 : 3)}%`,
    [rounds],
  )

  return (
    <div className="lab-page verifier-lab">
      <LabHeader
        eyebrow="randomized verification · Freivalds’ algorithm"
        title="Verify matrix multiplication"
        description="Check whether A × B = C without recomputing the full product. Random binary vectors expose a wrong answer quickly."
        badge="O(n²) per round"
      />

      <ConceptExplainer
        problem="Given matrices A, B, and a claimed product C, the task is to decide whether A × B really equals C. Multiplying A and B again gives certainty, but the standard calculation takes cubic time for n × n matrices."
        algorithmName="Freivalds’ algorithm"
        algorithm="Freivalds’ algorithm compresses the matrices with a random binary vector r and compares A(Br) with Cr. A correct product always passes. A false product can occasionally pass one round by chance, but each independent round cuts that false-positive probability by at least half."
        steps={[
          'Generate a random vector containing only 0s and 1s.',
          'Compute A(Br) and Cr using matrix-vector products.',
          'Reject on any mismatch; repeat matches for more confidence.',
        ]}
      />

      <div className="lab-layout section-wrap">
        <aside className="control-panel">
          <div className="panel-heading">
            <span>01</span>
            <div>
              <strong>Create a claim</strong>
              <p>Generate A, B, and their proposed product C.</p>
            </div>
          </div>
          <label className="range-control">
            <span>
              Matrix size{' '}
              <strong>
                {size} × {size}
              </strong>
            </span>
            <input
              type="range"
              min="2"
              max="5"
              value={size}
              onChange={(event) => setSize(Number(event.target.value))}
            />
            <small>
              <span>2 × 2</span>
              <span>5 × 5</span>
            </small>
          </label>
          <button
            className="button button-secondary button-full"
            onClick={regenerate}
          >
            <span aria-hidden="true">↻</span> Generate matrices
          </button>
          <button className="text-action" onClick={toggleTamper}>
            {tampered
              ? 'Restore the correct product'
              : 'Introduce a hidden error'}
          </button>

          <div className="panel-divider" />
          <div className="panel-heading">
            <span>02</span>
            <div>
              <strong>Run the verifier</strong>
              <p>More rounds reduce the chance of accepting a false claim.</p>
            </div>
          </div>
          <label className="range-control">
            <span>
              Rounds <strong>{rounds}</strong>
            </span>
            <input
              type="range"
              min="1"
              max="10"
              value={rounds}
              onChange={(event) => setRounds(Number(event.target.value))}
            />
            <small>
              <span>Fast</span>
              <span>Stronger</span>
            </small>
          </label>
          <button
            className="button button-primary button-full"
            onClick={verify}
          >
            <span aria-hidden="true">▶</span> Verify A × B = C
          </button>
          <div className="request-preview">
            <span>Error bound</span>
            <code>
              Pr[false positive] ≤ 2⁻{rounds} = {failureProbability}
            </code>
          </div>
        </aside>

        <section className="visualizer-panel verifier-panel">
          <div className="visualizer-topbar">
            <div>
              <span className="live-dot" /> Matrix claim
            </div>
            <span>
              {tampered
                ? 'C contains one altered cell'
                : 'C is the true product'}
            </span>
          </div>
          <div className="matrix-equation">
            <MatrixView label="A" matrix={problem.a} />
            <span className="equation-mark">×</span>
            <MatrixView label="B" matrix={problem.b} />
            <span className="equation-mark">=</span>
            <MatrixView
              label="C"
              matrix={problem.product}
              highlight={tampered}
            />
          </div>
          <div className="trial-strip" aria-live="polite">
            {trials.length === 0 ? (
              <p>
                Each round compares A(Br) with Cr for a fresh random vector r.
              </p>
            ) : (
              trials.map((trial, index) => (
                <div
                  key={index}
                  className={trial.passed ? 'trial-pass' : 'trial-fail'}
                >
                  <span>
                    r{index + 1} = [{trial.vector.join(', ')}]
                  </span>
                  <strong>{trial.passed ? 'match' : 'mismatch'}</strong>
                </div>
              ))
            )}
          </div>
        </section>

        <section
          className="metrics-panel verifier-result"
          aria-label="Verification result"
        >
          <div className="metrics-heading">
            <div>
              <span>03</span>
              <strong>Read the verdict</strong>
            </div>
            {trials.length > 0 && <i>complete</i>}
          </div>
          <div className="verdict-copy">
            <span
              className={`verdict-icon ${trials.length > 0 ? (accepted ? 'accepted' : 'rejected') : ''}`}
            >
              {trials.length === 0 ? '?' : accepted ? '✓' : '×'}
            </span>
            <div>
              <strong>
                {trials.length === 0
                  ? 'Ready to verify'
                  : accepted
                    ? 'Claim accepted'
                    : 'Claim rejected'}
              </strong>
              <p>
                {trials.length === 0
                  ? 'Run at least one randomized round.'
                  : accepted
                    ? `All ${rounds} checks matched. The claim is probably correct.`
                    : 'A random vector exposed the incorrect product.'}
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

function MatrixView({
  label,
  matrix,
  highlight = false,
}: {
  label: string
  matrix: Matrix
  highlight?: boolean
}) {
  return (
    <div className="matrix-block">
      <span>{label}</span>
      <div
        className="matrix-grid"
        style={{ gridTemplateColumns: `repeat(${matrix.length}, 1fr)` }}
      >
        {matrix.flatMap((row, rowIndex) =>
          row.map((value, columnIndex) => (
            <i
              key={`${rowIndex}-${columnIndex}`}
              className={
                highlight && rowIndex === 0 && columnIndex === 0
                  ? 'changed-cell'
                  : ''
              }
            >
              {value}
            </i>
          )),
        )}
      </div>
    </div>
  )
}

function generateProblem(size: number) {
  const randomMatrix = () =>
    Array.from({ length: size }, () =>
      Array.from({ length: size }, () => Math.floor(Math.random() * 7) - 3),
    )
  const a = randomMatrix()
  const b = randomMatrix()
  return { a, b, product: multiplyMatrices(a, b) }
}

function multiplyMatrices(a: Matrix, b: Matrix) {
  return a.map((row) =>
    b.map((_, column) =>
      row.reduce((sum, value, index) => sum + value * b[index][column], 0),
    ),
  )
}

function multiplyVector(matrix: Matrix, vector: number[]) {
  return matrix.map((row) =>
    row.reduce((sum, value, index) => sum + value * vector[index], 0),
  )
}
