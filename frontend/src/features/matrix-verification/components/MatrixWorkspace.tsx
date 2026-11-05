import { DottedSurface, VisualizerPanel } from '../../../components/LabPanels'
import { cn } from '../../../lib/utils'
import type { MatrixClaim, MatrixTrial } from '../../../lib/apiSchemas'
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
    <VisualizerPanel className="min-h-[520px]">
      <VisualizerTopbar
        status="A × B = C"
        detail="Orange cells differ from the generated matrices"
      />
      <DottedSurface className="min-h-[350px] p-7 max-[680px]:px-4.5">
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
      </DottedSurface>
      <div
        className="grid min-h-[110px] grid-cols-2 content-center gap-x-5 gap-y-1.5 border-t px-5 py-4 max-[680px]:grid-cols-1"
        aria-live="polite"
      >
        {trials.length === 0 ? (
          <p className="col-span-full text-center text-xs text-muted-foreground">
            Each round compares A(Br) with Cr for a fresh random vector r.
          </p>
        ) : (
          trials.map((trial, index) => (
            <div
              key={index}
              className={cn(
                'flex justify-between rounded px-2 py-1.5 font-mono text-xs leading-[normal]',
                trial.passed
                  ? 'bg-[#e9f2eb] text-[#397155]'
                  : 'bg-[#f9e8e1] text-[#974f36]',
              )}
            >
              <span>
                r{index + 1} = [{trial.vector.join(', ')}]
              </span>
              <strong>{trial.passed ? 'match' : 'mismatch'}</strong>
            </div>
          ))
        )}
      </div>
    </VisualizerPanel>
  )
}
