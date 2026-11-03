import labStyles from '../../../components/lab.module.css'
import { PanelHeading } from '../../../components/PanelHeading'
import { RangeControl } from '../../../components/RangeControl'
import { Button } from '../../../components/ui/button'

interface MinCutControlsProps {
  vertexCount: number
  trials: number
  error: string
  isGenerating: boolean
  isSolving: boolean
  onVertexCountChange: (count: number) => void
  onTrialsChange: (trials: number) => void
  onGenerate: () => void
  onSolve: () => void
}

export function MinCutControls({
  vertexCount,
  trials,
  error,
  isGenerating,
  isSolving,
  onVertexCountChange,
  onTrialsChange,
  onGenerate,
  onSolve,
}: MinCutControlsProps) {
  const disabled = isGenerating || isSolving

  return (
    <aside className={labStyles['control-panel']}>
      <PanelHeading
        step="01"
        title="Generate a problem"
        description="Build a connected graph with a hidden bottleneck."
      />
      <RangeControl
        label="Vertices"
        value={vertexCount}
        inputValue={vertexCount}
        min={5}
        max={10}
        disabled={disabled}
        startLabel="5"
        endLabel="10"
        onChange={onVertexCountChange}
      />
      <Button
        variant="secondary"
        className="min-h-[43px] w-full text-[0.72rem]"
        onClick={onGenerate}
        disabled={disabled}
      >
        <span aria-hidden="true">↻</span>{' '}
        {isGenerating ? 'Generating…' : 'Generate new graph'}
      </Button>
      <div className={labStyles['panel-divider']} />
      <PanelHeading
        step="02"
        title="Ask the backend"
        description="Repeat random contractions and keep the smallest cut."
      />
      <RangeControl
        label="Trials"
        value={trials}
        inputValue={trials}
        min={10}
        max={250}
        step={10}
        disabled={disabled}
        startLabel="Quick"
        endLabel="Confident"
        onChange={onTrialsChange}
      />
      <Button
        className="min-h-[43px] w-full text-[0.72rem]"
        onClick={onSolve}
        disabled={disabled}
      >
        {isSolving ? (
          <span className={labStyles['spinner']} />
        ) : (
          <span aria-hidden="true">▶</span>
        )}
        {isSolving ? 'Contracting…' : 'Find minimum cut'}
      </Button>
      {error && (
        <div className={labStyles['error-message']} role="alert">
          <strong>Couldn’t calculate the cut</strong>
          <span>{error}</span>
        </div>
      )}
      <div className={labStyles['request-preview']}>
        <span>Request</span>
        <code>
          POST /api/problems/minimum-cut/solve · local fallback
          <br />
          trials: {trials}
        </code>
      </div>
    </aside>
  )
}
