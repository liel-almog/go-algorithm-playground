import shellStyles from '../../styles/shell.module.css'
import { ConceptExplainer } from '../../components/ConceptExplainer'
import { PuzzleControls } from './components/PuzzleControls'
import { PuzzleVisualizer } from './components/PuzzleVisualizer'
import { ResultMetrics } from './components/ResultMetrics'
import { puzzleExplanations } from './content'
import { useEightPuzzle } from './hooks/useEightPuzzle'

export function EightPuzzlePage() {
  const puzzle = useEightPuzzle()
  const explanation = puzzleExplanations[puzzle.algorithm.id]

  return (
    <>
      <ConceptExplainer
        problem="Choose the board's row and column counts, then slide a tile beside the gap. The goal is to arrange every numbered tile in ascending order with the empty space last."
        algorithmName={puzzle.algorithm.name}
        algorithm={explanation.algorithm}
        steps={explanation.steps}
      />

      <div
        className={`${shellStyles['lab-layout']} ${shellStyles['section-wrap']}`}
      >
        <PuzzleControls
          algorithm={puzzle.algorithm}
          algorithms={puzzle.algorithms}
          algorithmId={puzzle.algorithmId}
          scramble={puzzle.scramble}
          rows={puzzle.rows}
          columns={puzzle.columns}
          hasPuzzle={puzzle.tiles.length > 0 && !puzzle.result}
          canReset={puzzle.initialTiles.length > 0}
          isGenerating={puzzle.isGenerating}
          isSolving={puzzle.isSolving}
          error={puzzle.error}
          onAlgorithmChange={puzzle.selectAlgorithm}
          onScrambleChange={puzzle.setScramble}
          onRowsChange={puzzle.changeRows}
          onColumnsChange={puzzle.changeColumns}
          onGenerate={puzzle.generateProblem}
          onSolve={puzzle.runAlgorithm}
          onReset={puzzle.resetBoard}
        />

        <PuzzleVisualizer
          tiles={puzzle.visibleTiles}
          rows={puzzle.rows}
          columns={puzzle.columns}
          currentMove={puzzle.currentMove}
          playerMoves={puzzle.playerMoves}
          playerSolved={puzzle.playerSolved}
          result={puzzle.result}
          step={puzzle.step}
          isPlaying={puzzle.isPlaying}
          isGenerating={puzzle.isGenerating}
          isInteractive={puzzle.isInteractive}
          generationSource={puzzle.generationSource}
          onTileClick={puzzle.moveTile}
          onReset={puzzle.resetBoard}
          onPrevious={puzzle.previousStep}
          onTogglePlayback={puzzle.togglePlayback}
          onNext={puzzle.nextStep}
        />

        <ResultMetrics result={puzzle.result} />
      </div>
    </>
  )
}
