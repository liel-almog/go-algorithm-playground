import { ControlError } from '../../../components/ControlError'
import { CodePreview } from '../../../components/CodePreview'
import { Spinner } from '../../../components/Spinner'
import { ControlPanel, PanelDivider } from '../../../components/LabPanels'
import { Play, RotateCcw, Shuffle } from 'lucide-react'
import type { Algorithm } from '../../../lib/apiSchemas'
import { PanelHeading } from '../../../components/PanelHeading'
import { RangeControl } from '../../../components/RangeControl'
import { Button } from '../../../components/ui/button'
import { NativeSelect } from '../../../components/ui/native-select'

interface PuzzleControlsProps {
  algorithm: Algorithm
  algorithms: Algorithm[]
  algorithmId: string
  scramble: number
  rows: number
  columns: number
  hasPuzzle: boolean
  canReset: boolean
  isGenerating: boolean
  isSolving: boolean
  error: string
  onAlgorithmChange: (algorithmId: string) => void
  onScrambleChange: (scramble: number) => void
  onRowsChange: (rows: number) => void
  onColumnsChange: (columns: number) => void
  onGenerate: () => void
  onSolve: () => void
  onReset: () => void
}

export function PuzzleControls({
  algorithm,
  algorithms,
  algorithmId,
  scramble,
  rows,
  columns,
  hasPuzzle,
  canReset,
  isGenerating,
  isSolving,
  error,
  onAlgorithmChange,
  onScrambleChange,
  onRowsChange,
  onColumnsChange,
  onGenerate,
  onSolve,
  onReset,
}: PuzzleControlsProps) {
  const isBusy = isGenerating || isSolving

  return (
    <ControlPanel>
      <PanelHeading
        step="01"
        title="Generate a problem"
        description="Every generated board is solvable."
      />

      <div className="grid grid-cols-2 gap-2.5">
        <label className="mb-3.5 block">
          <span className="mb-2 block text-xs text-muted-foreground">Rows</span>
          <NativeSelect
            value={rows}
            onChange={(event) => onRowsChange(Number(event.target.value))}
            disabled={isBusy}
          >
            {[2, 3, 4].map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </NativeSelect>
        </label>
        <label className="mb-3.5 block">
          <span className="mb-2 block text-xs text-muted-foreground">
            Columns
          </span>
          <NativeSelect
            value={columns}
            onChange={(event) => onColumnsChange(Number(event.target.value))}
            disabled={isBusy}
          >
            {[2, 3, 4].map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </NativeSelect>
        </label>
      </div>

      <RangeControl
        label="Scramble depth"
        value={scramble}
        inputValue={scramble}
        min={4}
        max={36}
        disabled={isBusy}
        startLabel="Gentle"
        endLabel="Deeper"
        onChange={onScrambleChange}
      />

      <Button
        variant="secondary"
        className="min-h-12 w-full gap-2.5 rounded-xl px-4 text-sm"
        onClick={onGenerate}
        disabled={isBusy}
      >
        <Shuffle aria-hidden="true" className="size-4" />
        {isGenerating ? 'Generating…' : 'Generate new puzzle'}
      </Button>

      <PanelDivider />

      <PanelHeading
        step="02"
        title="Choose a solver"
        description="Run one backend algorithm on the current board."
      />

      <label className="mt-5 mb-3.5 block">
        <span className="mb-2 block text-xs text-muted-foreground">
          Algorithm
        </span>
        <NativeSelect
          value={algorithmId}
          onChange={(event) => onAlgorithmChange(event.target.value)}
          disabled={isSolving}
        >
          {algorithms.map((option) => (
            <option key={option.id} value={option.id}>
              {option.id === 'astar' ? 'A*' : option.id.toUpperCase()} —{' '}
              {option.name}
            </option>
          ))}
        </NativeSelect>
      </label>

      <Button
        className="min-h-12 w-full gap-2.5 rounded-xl px-4 text-sm"
        onClick={onSolve}
        disabled={!hasPuzzle || isBusy}
      >
        {isSolving ? (
          <Spinner />
        ) : (
          <Play aria-hidden="true" className="size-4 fill-current" />
        )}
        {isSolving
          ? 'Searching…'
          : `Run ${algorithm.id === 'astar' ? 'A*' : algorithm.id.toUpperCase()}`}
      </Button>

      <Button
        variant="outline"
        className="mt-3 min-h-11 w-full gap-2 rounded-xl border-[#d5ded3] bg-white/70 px-4 text-sm text-secondary-foreground hover:border-[#adc7b4] hover:bg-[#f1f6f0]"
        onClick={onReset}
        disabled={!canReset || isBusy}
      >
        <RotateCcw aria-hidden="true" className="size-4" />
        Reset board and moves
      </Button>

      <ControlError title="Couldn’t reach a solution" message={error} />

      <CodePreview label="Requests">
        POST /api/problems/eight-puzzle/generate
        <br />
        POST /api/problems/eight-puzzle/{algorithm.id}/solve
        <br />
        row: {rows}, column: {columns}
      </CodePreview>
    </ControlPanel>
  )
}
