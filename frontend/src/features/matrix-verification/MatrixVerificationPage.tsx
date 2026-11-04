import { LabLayout } from '../../components/PageLayout'
import { RequestError } from '../../components/RequestError'
import { ConceptExplainer } from '../../components/ConceptExplainer'
import { LabHeader } from '../../components/LabHeader'
import { VerificationVerdict } from '../../components/VerificationVerdict'
import { ErrorProbabilityNote } from './components/ErrorProbabilityNote'
import { MatrixControls } from './components/MatrixControls'
import { MatrixWorkspace } from './components/MatrixWorkspace'
import { useMatrixVerification } from './hooks/useMatrixVerification'

export function MatrixVerificationPage() {
  const lab = useMatrixVerification()

  return (
    <div className="pb-[70px]">
      <LabHeader
        eyebrow="randomized verification · Freivalds’ algorithm"
        title="Verify matrix multiplication"
        description="Check whether A × B = C without recomputing the full product. Random binary vectors expose a wrong answer quickly."
        badge="O(n²) per round"
      />
      <ConceptExplainer
        problem="Given matrices A, B, and a claimed product C, the task is to decide whether A × B really equals C. Multiplying A and B again gives certainty, but the standard calculation takes cubic time for n × n matrices."
        algorithmName="Freivalds’ algorithm"
        algorithm="Freivalds’ algorithm compresses the matrices with a random binary vector r and compares A(Br) with Cr. A correct product always passes. A false product can occasionally pass one round by chance, but each independent round cuts that false-positive probability by at least half."
        steps={[
          'Generate a random vector containing only 0s and 1s.',
          'Compute A(Br) and Cr using matrix-vector products.',
          'Reject on any mismatch; repeat matches for more confidence.',
        ]}
      />
      <LabLayout>
        {lab.error && (
          <div className="col-span-full">
            <RequestError error={lab.error} />
          </div>
        )}
        <MatrixControls
          size={lab.size}
          rounds={lab.rounds}
          tampered={lab.isTampered}
          isGenerating={lab.isGenerating}
          isVerifying={lab.isVerifying}
          failureProbability={lab.failureProbability}
          onSizeChange={lab.changeSize}
          onRoundsChange={lab.changeRounds}
          onGenerate={lab.generate}
          onToggleTamper={lab.toggleTamper}
          onVerify={lab.verify}
        />
        <MatrixWorkspace
          problem={lab.claim}
          original={lab.originalClaim}
          trials={lab.trials}
          disabled={lab.isBusy}
          onCellChange={lab.changeCell}
        />
        <VerificationVerdict
          ariaLabel="Verification result"
          hasResult={lab.hasResult}
          accepted={lab.accepted}
          idleTitle="Ready to verify"
          acceptedTitle="Claim accepted"
          rejectedTitle="Claim rejected"
          idleDescription="Run at least one randomized round."
          acceptedDescription={
            <span className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-2">
              <span>All {lab.trials.length} checks matched.</span>
              <ErrorProbabilityNote
                rounds={lab.rounds}
                probability={lab.failureProbability}
              />
            </span>
          }
          rejectedDescription="A random vector exposed the incorrect product."
        />
      </LabLayout>
    </div>
  )
}
