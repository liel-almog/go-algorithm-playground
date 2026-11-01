import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { LabHeader } from './algorithms.$algorithmId'
import { ConceptExplainer } from '../components/ConceptExplainer'

export const Route = createFileRoute('/problems/polynomial-identity')({
  component: PolynomialIdentityPage,
})

const prime = 101
type Check = { point: number; left: number; right: number; passed: boolean }

function PolynomialIdentityPage() {
  const [degree, setDegree] = useState(4)
  const [rounds, setRounds] = useState(4)
  const [left, setLeft] = useState(() => randomCoefficients(4))
  const [right, setRight] = useState(() => [...left])
  const [checks, setChecks] = useState<Check[]>([])

  const generate = () => {
    const coefficients = randomCoefficients(degree)
    setLeft(coefficients)
    setRight([...coefficients])
    setChecks([])
  }

  const alter = () => {
    setRight((current) => {
      const next = [...current]
      const index = Math.floor(Math.random() * next.length)
      next[index] = (next[index] + 1 + Math.floor(Math.random() * 9)) % prime
      return next
    })
    setChecks([])
  }

  const verify = () => {
    setChecks(
      Array.from({ length: rounds }, () => {
        const point = 1 + Math.floor(Math.random() * (prime - 1))
        const leftValue = evaluate(left, point)
        const rightValue = evaluate(right, point)
        return {
          point,
          left: leftValue,
          right: rightValue,
          passed: leftValue === rightValue,
        }
      }),
    )
  }

  const identical = checks.length > 0 && checks.every((check) => check.passed)
  const updateCoefficient = (
    side: 'left' | 'right',
    index: number,
    value: number,
  ) => {
    const setter = side === 'left' ? setLeft : setRight
    setter((current) =>
      current.map((coefficient, position) =>
        position === index ? value : coefficient,
      ),
    )
    setChecks([])
  }

  return (
    <div className="lab-page verifier-lab polynomial-lab">
      <LabHeader
        eyebrow="randomized verification · Schwartz–Zippel"
        title="Verify polynomial identities"
        description="Test whether two coefficient forms describe the same polynomial. Evaluate both at random field points instead of expanding every term."
        badge={`Arithmetic mod ${prime}`}
      />

      <ConceptExplainer
        problem="Two polynomials can look different yet represent the same function after their terms are expanded and simplified. Polynomial identity testing asks whether P(x) and Q(x) are equal for every input, without performing a potentially expensive symbolic expansion."
        algorithmName="Schwartz–Zippel"
        algorithm="The Schwartz–Zippel test evaluates both polynomials at a randomly chosen point in a finite field. Identical polynomials always match. If they differ, their difference has only a limited number of roots, so a random point is unlikely to hide the discrepancy; additional samples strengthen the evidence."
        steps={[
          'Choose a random value r from the finite field.',
          'Evaluate P(r) and Q(r) with modular arithmetic.',
          'Reject on a mismatch; repeat matches to lower the error chance.',
        ]}
      />

      <div className="lab-layout section-wrap">
        <aside className="control-panel">
          <div className="panel-heading">
            <span>01</span>
            <div>
              <strong>Create two polynomials</strong>
              <p>Generate a matching pair, then edit or perturb it.</p>
            </div>
          </div>
          <label className="range-control">
            <span>
              Degree <strong>{degree}</strong>
            </span>
            <input
              type="range"
              min="2"
              max="7"
              value={degree}
              onChange={(event) => setDegree(Number(event.target.value))}
            />
            <small>
              <span>Quadratic</span>
              <span>Degree 7</span>
            </small>
          </label>
          <button
            className="button button-secondary button-full"
            onClick={generate}
          >
            <span aria-hidden="true">↻</span> Generate identity
          </button>
          <button className="text-action" onClick={alter}>
            Change one random coefficient
          </button>
          <div className="panel-divider" />
          <div className="panel-heading">
            <span>02</span>
            <div>
              <strong>Test random points</strong>
              <p>Each matching evaluation adds evidence.</p>
            </div>
          </div>
          <label className="range-control">
            <span>
              Rounds <strong>{rounds}</strong>
            </span>
            <input
              type="range"
              min="1"
              max="8"
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
            <span aria-hidden="true">▶</span> Verify identity
          </button>
          <div className="request-preview">
            <span>Method</span>
            <code>
              Choose r ∈ 𝔽₁₀₁
              <br />
              Compare P(r) and Q(r)
            </code>
          </div>
        </aside>

        <section className="visualizer-panel verifier-panel polynomial-panel">
          <div className="visualizer-topbar">
            <div>
              <span className="live-dot" /> Identity claim
            </div>
            <span>Editable coefficients</span>
          </div>
          <div className="polynomial-workspace">
            <CoefficientEditor
              name="P(x)"
              coefficients={left}
              onChange={(index, value) =>
                updateCoefficient('left', index, value)
              }
            />
            <div className="identity-mark">≟</div>
            <CoefficientEditor
              name="Q(x)"
              coefficients={right}
              onChange={(index, value) =>
                updateCoefficient('right', index, value)
              }
            />
          </div>
          <div className="evaluation-table">
            <div className="evaluation-head">
              <span>Random point</span>
              <span>P(r)</span>
              <span>Q(r)</span>
              <span>Check</span>
            </div>
            {checks.length === 0 ? (
              <p>Run the verifier to sample points from 𝔽₁₀₁.</p>
            ) : (
              checks.map((check, index) => (
                <div
                  key={index}
                  className={check.passed ? 'trial-pass' : 'trial-fail'}
                >
                  <span>r = {check.point}</span>
                  <span>{check.left}</span>
                  <span>{check.right}</span>
                  <strong>{check.passed ? 'match' : 'mismatch'}</strong>
                </div>
              ))
            )}
          </div>
        </section>

        <section
          className="metrics-panel verifier-result"
          aria-label="Identity result"
        >
          <div className="metrics-heading">
            <div>
              <span>03</span>
              <strong>Read the verdict</strong>
            </div>
            {checks.length > 0 && <i>complete</i>}
          </div>
          <div className="verdict-copy">
            <span
              className={`verdict-icon ${checks.length > 0 ? (identical ? 'accepted' : 'rejected') : ''}`}
            >
              {checks.length === 0 ? '?' : identical ? '✓' : '×'}
            </span>
            <div>
              <strong>
                {checks.length === 0
                  ? 'Ready to verify'
                  : identical
                    ? 'Identity accepted'
                    : 'Not an identity'}
              </strong>
              <p>
                {checks.length === 0
                  ? 'Choose the number of rounds and start the test.'
                  : identical
                    ? `P and Q matched at all ${rounds} sampled points.`
                    : 'One evaluation was enough to prove P and Q differ.'}
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

function CoefficientEditor({
  name,
  coefficients,
  onChange,
}: {
  name: string
  coefficients: number[]
  onChange: (index: number, value: number) => void
}) {
  return (
    <div className="coefficient-editor">
      <strong>{name}</strong>
      <div>
        {coefficients.map((coefficient, index) => (
          <label key={index}>
            <span>{index === 0 ? '1' : index === 1 ? 'x' : `x${index}`}</span>
            <input
              type="number"
              min="0"
              max="100"
              value={coefficient}
              onChange={(event) =>
                onChange(index, Number(event.target.value) % prime)
              }
            />
          </label>
        ))}
      </div>
    </div>
  )
}

function randomCoefficients(degree: number) {
  return Array.from({ length: degree + 1 }, () =>
    Math.floor(Math.random() * 13),
  )
}

function evaluate(coefficients: number[], point: number) {
  return coefficients.reduceRight(
    (value, coefficient) => (value * point + coefficient) % prime,
    0,
  )
}
