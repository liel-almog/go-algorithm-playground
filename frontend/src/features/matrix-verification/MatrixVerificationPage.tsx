import { useMutation } from '@tanstack/react-query'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ConceptExplainer } from '../../components/ConceptExplainer'
import { LabHeader } from '../../components/LabHeader'
import { VerificationVerdict } from '../../components/VerificationVerdict'
import type { MatrixClaim, MatrixTrial } from '../../lib/api'
import { MatrixControls } from './components/MatrixControls'
import { MatrixWorkspace } from './components/MatrixWorkspace'
import { generateLocalProblem, verifyLocally } from './matrixVerification'
import { matrixVerificationMutations } from './mutations'

export function MatrixVerificationPage() {
  const [size, setSize] = useState(3)
  const [rounds, setRounds] = useState(5)
  const [problem, setProblem] = useState<MatrixClaim>(() =>
    generateLocalProblem(3),
  )
  const [trials, setTrials] = useState<MatrixTrial[]>([])
  const [tampered, setTampered] = useState(false)
  const didGenerate = useRef(false)
  const generation = useMutation(matrixVerificationMutations.generate())
  const verification = useMutation(matrixVerificationMutations.solve())

  const regenerate = useCallback(
    async (requestedSize = size) => {
      setTrials([])
      setTampered(false)
      generation.reset()
      verification.reset()
      try {
        setProblem(await generation.mutateAsync({ size: requestedSize }))
      } catch {
        setProblem(generateLocalProblem(requestedSize))
        generation.reset()
      }
    },
    [generation, size, verification],
  )

  useEffect(() => {
    if (didGenerate.current) return
    didGenerate.current = true
    void regenerate()
  }, [regenerate])

  const changeSize = (nextSize: number) => {
    setSize(nextSize)
    void regenerate(nextSize)
  }

  const toggleTamper = () => {
    setProblem((current) => {
      const product = current.product.map((row) => [...row])
      const firstRow = product[0]
      const firstValue = firstRow?.[0]
      if (!firstRow || firstValue === undefined) return current
      firstRow[0] = firstValue + (tampered ? -1 : 1)
      return { ...current, product }
    })
    setTampered((current) => !current)
    setTrials([])
    verification.reset()
  }

  const verify = async () => {
    verification.reset()
    setTrials([])
    try {
      const result = await verification.mutateAsync({ claim: problem, rounds })
      setTrials(result.trials)
    } catch {
      setTrials(verifyLocally(problem, rounds))
      verification.reset()
    }
  }

  const accepted = trials.length > 0 && trials.every((trial) => trial.passed)
  const failureProbability = useMemo(
    () => `${(100 / 2 ** rounds).toFixed(rounds > 6 ? 2 : 3)}%`,
    [rounds],
  )

  return (
    <div className="lab-page verifier-lab">
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
      <div className="lab-layout section-wrap">
        <MatrixControls
          size={size}
          rounds={rounds}
          tampered={tampered}
          isGenerating={generation.isPending}
          isVerifying={verification.isPending}
          failureProbability={failureProbability}
          onSizeChange={changeSize}
          onRoundsChange={setRounds}
          onGenerate={() => void regenerate()}
          onToggleTamper={toggleTamper}
          onVerify={() => void verify()}
        />
        <MatrixWorkspace
          problem={problem}
          trials={trials}
          tampered={tampered}
        />
        <VerificationVerdict
          ariaLabel="Verification result"
          hasResult={trials.length > 0}
          accepted={accepted}
          idleTitle="Ready to verify"
          acceptedTitle="Claim accepted"
          rejectedTitle="Claim rejected"
          idleDescription="Run at least one randomized round."
          acceptedDescription={`All ${rounds} checks matched. The claim is probably correct.`}
          rejectedDescription="A random vector exposed the incorrect product."
        />
      </div>
    </div>
  )
}
