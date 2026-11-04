import { LabLayout, PageSection } from '../../components/PageLayout'
import { Link } from '@tanstack/react-router'
import { ConceptExplainer } from '../../components/ConceptExplainer'
import { LabHeader } from '../../components/LabHeader'
import { MinCutControls } from './components/MinCutControls'
import { MinCutMetrics } from './components/MinCutMetrics'
import { MinCutWorkspace } from './components/MinCutWorkspace'
import { useMinCut } from './hooks/useMinCut'

export function MinCutPage() {
  const lab = useMinCut()

  return (
    <div className="pb-[70px]">
      <LabHeader
        eyebrow="randomized graph · minimum cut"
        title="The minimum cut problem"
        description="Find the smallest set of edges whose removal separates a graph. Karger’s contractions make the hidden split visible."
        badge="Probabilistic result"
      />
      <ConceptExplainer
        problem="A cut divides a connected graph into two non-empty groups. Its size is the number of edges that cross between them. The minimum-cut problem asks for the division with the fewest crossing edges—the graph’s weakest connection or bottleneck."
        algorithmName="Karger’s algorithm"
        algorithm="Karger’s algorithm repeatedly picks a random edge and merges its two endpoints, discarding self-loops along the way. When only two supernodes remain, the edges between them form a cut. Repeating the random experiment makes it increasingly likely that one trial preserves the true minimum cut."
        steps={[
          'Choose an edge uniformly at random.',
          'Contract its endpoints and remove self-loops.',
          'Keep the smallest two-supernode cut across all trials.',
        ]}
      />
      <LabLayout>
        <MinCutControls
          vertexCount={lab.vertexCount}
          trials={lab.trials}
          error={lab.error}
          isGenerating={lab.isGenerating}
          isSolving={lab.isSolving}
          onVertexCountChange={lab.changeVertexCount}
          onTrialsChange={lab.changeTrials}
          onGenerate={lab.generate}
          onSolve={lab.solve}
        />
        <MinCutWorkspace graph={lab.graph} result={lab.result} />
        <MinCutMetrics result={lab.result} />
      </LabLayout>
      <PageSection className="mt-[25px] flex justify-between border-t py-[25px] text-xs text-muted-foreground">
        <span>Try another family</span>
        <Link to="/problems/eight-puzzle" className="font-bold text-primary">
          Explore informed search →
        </Link>
      </PageSection>
    </div>
  )
}
