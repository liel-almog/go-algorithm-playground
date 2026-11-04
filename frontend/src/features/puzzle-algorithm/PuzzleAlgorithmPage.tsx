import { LabLayout } from '../../components/PageLayout'
import { ConceptExplainer } from '../../components/ConceptExplainer'
import { LabHeader } from '../../components/LabHeader'
import { AlgorithmNotFound } from './components/AlgorithmNotFound'
import { PuzzleControls } from './components/PuzzleControls'
import { PuzzleMetrics } from './components/PuzzleMetrics'
import { PuzzleVisualizer } from './components/PuzzleVisualizer'
import { puzzleExplanations } from './content'
import { usePuzzleAlgorithm } from './hooks/usePuzzleAlgorithm'

interface PuzzleAlgorithmPageProps {
  algorithmId: string
}

export function PuzzleAlgorithmPage({ algorithmId }: PuzzleAlgorithmPageProps) {
  const lab = usePuzzleAlgorithm(algorithmId)
  if (!lab.algorithm) return <AlgorithmNotFound />

  const explanation = puzzleExplanations[lab.algorithm.id]
  return (
    <div className="pb-[70px]">
      <LabHeader
        eyebrow="state-space search · classic 8-puzzle"
        title="The 8-puzzle problem"
        description={`Arrange eight sliding tiles using ${lab.algorithm.name}. Generate a valid board, solve it, then replay every move.`}
        badge={
          lab.algorithm.optimal ? 'Shortest path guaranteed' : 'Heuristic first'
        }
      />
      <ConceptExplainer
        problem="The 8-puzzle has eight numbered tiles and one empty space on a 3 × 3 board. A move slides one neighboring tile into the gap. The goal is to reach the ordered board in as few legal moves as possible, without searching every possible arrangement."
        algorithmName={lab.algorithm.name}
        algorithm={
          explanation?.algorithm ??
          'The solver explores legal board arrangements until it reaches the ordered goal state.'
        }
        steps={
          explanation?.steps ?? [
            'Start from the shuffled board.',
            'Explore boards reachable by one legal slide.',
            'Stop at the ordered board and reconstruct the moves.',
          ]
        }
      />
      <LabLayout>
        <PuzzleControls
          algorithm={lab.algorithm}
          scramble={lab.scramble}
          error={lab.error}
          isGenerating={lab.isGenerating}
          isSolving={lab.isSolving}
          canSolve={lab.tiles.length > 0 && !lab.result}
          onScrambleChange={lab.setScramble}
          onGenerate={lab.generateProblem}
          onSolve={lab.runAlgorithm}
        />
        <PuzzleVisualizer
          tiles={lab.tiles}
          result={lab.result}
          step={lab.step}
          isPlaying={lab.isPlaying}
          isGenerating={lab.isGenerating}
          onPrevious={lab.previousStep}
          onNext={lab.nextStep}
          onTogglePlayback={lab.togglePlayback}
        />
        <PuzzleMetrics result={lab.result} />
      </LabLayout>
    </div>
  )
}
