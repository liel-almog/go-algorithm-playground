import { ControlError } from '../../../components/ControlError'
import { CodePreview } from '../../../components/CodePreview'
import { Spinner } from '../../../components/Spinner'
import { ControlPanel, PanelDivider } from '../../../components/LabPanels'
import { Play, Shuffle } from 'lucide-react'
import { PanelHeading } from '../../../components/PanelHeading'
import { RangeControl } from '../../../components/RangeControl'
import { Button } from '../../../components/ui/button'
import type { Algorithm } from '../../../lib/api'

interface PuzzleControlsProps {
  algorithm: Algorithm
  scramble: number
  error: string
  isGenerating: boolean
  isSolving: boolean
  canSolve: boolean
  onScrambleChange: (scramble: number) => void
  onGenerate: () => void
  onSolve: () => void
}

export function PuzzleControls({
  algorithm,
  scramble,
  error,
  isGenerating,
  isSolving,
  canSolve,
  onScrambleChange,
  onGenerate,
  onSolve,
}: PuzzleControlsProps) {
  return (
    <ControlPanel>
      <PanelHeading
        step="01"
        title="Generate a problem"
        description="Start with a solvable, shuffled 8-puzzle."
      />
      <RangeControl
        label="Scramble depth"
        value={scramble}
        inputValue={scramble}
        min={4}
        max={36}
        disabled={isGenerating || isSolving}
        startLabel="Gentle"
        endLabel="Deeper"
        onChange={onScrambleChange}
      />
      <Button
        variant="secondary"
        className="min-h-12 w-full gap-2.5 rounded-xl px-4 text-sm"
        onClick={onGenerate}
        disabled={isGenerating || isSolving}
      >
        <Shuffle aria-hidden="true" className="size-4" />
        {isGenerating ? 'Generating…' : 'Generate new puzzle'}
      </Button>
      <PanelDivider />
      <PanelHeading
        step="02"
        title="Ask the backend"
        description={<>Run {algorithm.name} against this exact board.</>}
      />
      <Button
        className="min-h-12 w-full gap-2.5 rounded-xl px-4 text-sm"
        onClick={onSolve}
        disabled={!canSolve || isSolving || isGenerating}
      >
        {isSolving ? (
          <Spinner />
        ) : (
          <Play aria-hidden="true" className="size-4 fill-current" />
        )}
        {isSolving ? 'Searching…' : `Run ${algorithm.name}`}
      </Button>
      <ControlError title="Couldn’t reach a solution" message={error} />
      <CodePreview label="Request">
        POST /api/problems/eight-puzzle/solve
        <br />
        algorithm: “{algorithm.id}”
      </CodePreview>
    </ControlPanel>
  )
}
