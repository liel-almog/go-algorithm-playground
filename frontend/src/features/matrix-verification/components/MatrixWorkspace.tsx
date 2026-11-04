import labStyles from '../../../components/lab.module.css'
import verifierStyles from '../../../components/verifier.module.css'
import type { MatrixClaim, MatrixTrial } from '../../../lib/api'
import { VisualizerTopbar } from '../../../components/VisualizerTopbar'
import { MatrixView } from './MatrixView'

interface MatrixWorkspaceProps {
  problem: MatrixClaim
  trials: MatrixTrial[]
  original: MatrixClaim
  disabled: boolean
  onCellChange: (
    matrix: keyof MatrixClaim,
    row: number,
    column: number,
    value: number,
  ) => void
}

export function MatrixWorkspace({
  problem,
  trials,
  original,
  disabled,
  onCellChange,
}: MatrixWorkspaceProps) {
  return (
    <section
      className={`${labStyles['visualizer-panel']} ${labStyles['verifier-panel']}`}
    >
      <VisualizerTopbar
        status="A × B = C"
        detail="Orange cells differ from the generated matrices"
      />
      <div className={verifierStyles['matrix-equation']}>
        <section aria-labelledby="matrix-inputs-heading">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 id="matrix-inputs-heading" className="text-sm font-semibold">
              Input matrices
            </h2>
            <span className="rounded-full bg-secondary px-3 py-1 font-mono text-xs text-secondary-foreground">
              A × B
            </span>
          </div>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,260px),1fr))] gap-4">
            <MatrixView
              label="A"
              role="input"
              matrix={problem.a}
              original={original.a}
              disabled={disabled}
              onChange={(row, column, value) =>
                onCellChange('a', row, column, value)
              }
            />
            <MatrixView
              label="B"
              role="input"
              matrix={problem.b}
              original={original.b}
              disabled={disabled}
              onChange={(row, column, value) =>
                onCellChange('b', row, column, value)
              }
            />
          </div>
        </section>
        <div className="flex items-center justify-center gap-3 py-5 text-xs text-muted-foreground">
          <span aria-hidden="true" className="text-xl text-primary">
            ↓
          </span>
          Compare their product with C
        </div>
        <section aria-labelledby="matrix-result-heading">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 id="matrix-result-heading" className="text-sm font-semibold">
              Claimed result
            </h2>
            <span className="rounded-full bg-primary px-3 py-1 font-mono text-xs text-primary-foreground">
              C = A × B ?
            </span>
          </div>
          <MatrixView
            label="C"
            role="result"
            matrix={problem.product}
            original={original.product}
            disabled={disabled}
            onChange={(row, column, value) =>
              onCellChange('product', row, column, value)
            }
          />
          <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
            The verifier checks whether C equals A × B. Editing an input does
            not automatically update C.
          </p>
        </section>
      </div>
      <div className={verifierStyles['trial-strip']} aria-live="polite">
        {trials.length === 0 ? (
          <p>Each round compares A(Br) with Cr for a fresh random vector r.</p>
        ) : (
          trials.map((trial, index) => (
            <div
              key={index}
              className={
                trial.passed
                  ? verifierStyles['trial-pass']
                  : verifierStyles['trial-fail']
              }
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
