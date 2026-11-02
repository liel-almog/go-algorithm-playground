import type { MatrixClaim, MatrixTrial } from '../../../lib/api'
import { VisualizerTopbar } from '../../../components/VisualizerTopbar'
import { MatrixView } from './MatrixView'

interface MatrixWorkspaceProps {
  problem: MatrixClaim
  trials: MatrixTrial[]
  tampered: boolean
}

export function MatrixWorkspace({
  problem,
  trials,
  tampered,
}: MatrixWorkspaceProps) {
  return (
    <section className="visualizer-panel verifier-panel">
      <VisualizerTopbar
        status="Matrix claim"
        detail={
          tampered ? 'C contains one altered cell' : 'C is the true product'
        }
      />
      <div className="matrix-equation">
        <MatrixView label="A" matrix={problem.a} />
        <span className="equation-mark">×</span>
        <MatrixView label="B" matrix={problem.b} />
        <span className="equation-mark">=</span>
        <MatrixView label="C" matrix={problem.product} highlight={tampered} />
      </div>
      <div className="trial-strip" aria-live="polite">
        {trials.length === 0 ? (
          <p>Each round compares A(Br) with Cr for a fresh random vector r.</p>
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
  )
}
