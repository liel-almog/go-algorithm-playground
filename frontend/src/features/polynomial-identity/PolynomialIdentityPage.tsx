import { LabLayout } from '../../components/PageLayout'
import { RequestError } from '../../components/RequestError'
import { ConceptExplainer } from '../../components/ConceptExplainer'
import { LabHeader } from '../../components/LabHeader'
import { VerificationVerdict } from '../../components/VerificationVerdict'
import { PolynomialControls } from './components/PolynomialControls'
import { PolynomialWorkspace } from './components/PolynomialWorkspace'
import { prime } from './polynomialIdentity'
import { usePolynomialIdentity } from './hooks/usePolynomialIdentity'

export function PolynomialIdentityPage() {
  const lab = usePolynomialIdentity()

  return (
    <div className="pb-[70px]">
      <LabHeader
        eyebrow="randomized verification · Schwartz–Zippel"
        title="Verify polynomial identities"
        description="Test whether two coefficient forms describe the same polynomial. Evaluate both at random field points instead of expanding every term."
        badge={`Arithmetic mod ${prime}`}
      />
      <ConceptExplainer
        problem="Two polynomials can look different yet represent the same function after their terms are expanded and simplified. Polynomial identity testing asks whether P(x) and Q(x) are equal for every input, without performing a potentially expensive symbolic expansion."
        algorithmName="Schwartz–Zippel"
        algorithm="The Schwartz–Zippel test evaluates both polynomials at a randomly chosen point in a finite field. Identical polynomials always match. If they differ, their difference has only a limited number of roots, so a random point is unlikely to hide the discrepancy; additional samples strengthen the evidence."
        steps={[
          'Choose a random value r from the finite field.',
          'Evaluate P(r) and Q(r) with modular arithmetic.',
          'Reject on a mismatch; repeat matches to lower the error chance.',
        ]}
      />
      <LabLayout>
        {lab.error && (
          <div className="col-span-full">
            <RequestError error={lab.error} />
          </div>
        )}
        <PolynomialControls
          degree={lab.degree}
          rounds={lab.rounds}
          isGenerating={lab.isGenerating}
          isVerifying={lab.isVerifying}
          onDegreeChange={lab.changeDegree}
          onRoundsChange={lab.changeRounds}
          onGenerate={lab.generate}
          onAlter={lab.alterCoefficient}
          onVerify={lab.verify}
        />
        <PolynomialWorkspace
          left={lab.left}
          right={lab.right}
          checks={lab.checks}
          disabled={lab.isBusy}
          onCoefficientChange={lab.updateCoefficient}
        />
        <VerificationVerdict
          ariaLabel="Identity result"
          hasResult={lab.hasResult}
          accepted={lab.accepted}
          idleTitle="Ready to verify"
          acceptedTitle="Identity accepted"
          rejectedTitle="Not an identity"
          idleDescription="Choose the number of rounds and start the test."
          acceptedDescription={`P and Q matched at all ${lab.checks.length} sampled points.`}
          rejectedDescription="One evaluation was enough to prove P and Q differ."
        />
      </LabLayout>
    </div>
  )
}
