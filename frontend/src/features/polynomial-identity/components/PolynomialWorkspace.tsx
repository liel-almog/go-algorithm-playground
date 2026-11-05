import type { ComponentProps } from 'react'
import { DottedSurface, VisualizerPanel } from '../../../components/LabPanels'
import { cn } from '../../../lib/utils'
import type { PolynomialCheck } from '../../../lib/apiSchemas'
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

function EvaluationRow({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'grid grid-cols-[minmax(100px,1.3fr)_minmax(55px,0.8fr)_minmax(55px,0.8fr)_minmax(75px,1fr)] gap-2 px-2.5 py-[7px] font-mono text-xs leading-[normal]',
        className,
      )}
      {...props}
    />
  )
}

export function PolynomialWorkspace({
  left,
  right,
  checks,
  disabled,
  onCoefficientChange,
}: PolynomialWorkspaceProps) {
  return (
    <VisualizerPanel className="min-h-[520px]">
      <VisualizerTopbar
        status="Identity claim"
        detail="Editable coefficients"
      />
      <DottedSurface className="grid min-h-[325px] grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-5 p-7 max-[680px]:grid-cols-1 max-[680px]:gap-3 max-[680px]:p-4.5">
        <CoefficientEditor
          name="P(x)"
          coefficients={left}
          disabled={disabled}
          onChange={(index, value) => onCoefficientChange('left', index, value)}
        />
        <div className="text-[1.6rem] text-orange max-[680px]:text-center">
          ≟
        </div>
        <CoefficientEditor
          name="Q(x)"
          coefficients={right}
          disabled={disabled}
          onChange={(index, value) =>
            onCoefficientChange('right', index, value)
          }
        />
      </DottedSurface>
      <div className="min-h-[135px] overflow-x-auto border-t px-5 py-3">
        <EvaluationRow className="text-muted-foreground uppercase">
          <span>Random point</span>
          <span>P(r)</span>
          <span>Q(r)</span>
          <span>Check</span>
        </EvaluationRow>
        {checks.length === 0 ? (
          <p className="text-center text-xs text-muted-foreground">
            Run the verifier to sample points from 𝔽₁₀₁.
          </p>
        ) : (
          checks.map((check, index) => (
            <EvaluationRow
              key={index}
              className={
                check.passed
                  ? 'bg-[#e9f2eb] text-[#397155]'
                  : 'bg-[#f9e8e1] text-[#974f36]'
              }
            >
              <span>r = {check.point}</span>
              <span>{check.left}</span>
              <span>{check.right}</span>
              <strong>{check.passed ? 'match' : 'mismatch'}</strong>
            </EvaluationRow>
          ))
        )}
      </div>
    </VisualizerPanel>
  )
}
