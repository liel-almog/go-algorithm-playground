import type { PolynomialCheck } from '../../../lib/api'
import { VisualizerTopbar } from '../../../components/VisualizerTopbar'
import { CoefficientEditor } from './CoefficientEditor'

interface PolynomialWorkspaceProps {
  left: number[]
  right: number[]
  checks: PolynomialCheck[]
  disabled: boolean
  onCoefficientChange: (
    side: 'left' | 'right',
    index: number,
    value: number,
  ) => void
}

export function PolynomialWorkspace({
  left,
  right,
  checks,
  disabled,
  onCoefficientChange,
}: PolynomialWorkspaceProps) {
  return (
    <section className="visualizer-panel verifier-panel polynomial-panel">
      <VisualizerTopbar
        status="Identity claim"
        detail="Editable coefficients"
      />
      <div className="polynomial-workspace">
        <CoefficientEditor
          name="P(x)"
          coefficients={left}
          disabled={disabled}
          onChange={(index, value) => onCoefficientChange('left', index, value)}
        />
        <div className="identity-mark">≟</div>
        <CoefficientEditor
          name="Q(x)"
          coefficients={right}
          disabled={disabled}
          onChange={(index, value) =>
            onCoefficientChange('right', index, value)
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
  )
}
