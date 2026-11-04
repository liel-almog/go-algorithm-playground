import shellStyles from '../../styles/shell.module.css'
import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import { ConceptExplainer } from '../../components/ConceptExplainer'
import { LabHeader } from '../../components/LabHeader'
import { VerificationVerdict } from '../../components/VerificationVerdict'
import type { MatrixClaim, MatrixTrial } from '../../lib/api'
import { ErrorProbabilityNote } from './components/ErrorProbabilityNote'
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
  const [original, setOriginal] = useState(problem)
  const tampered = (Object.keys(problem) as Array<keyof MatrixClaim>).some(
    (key) =>
      problem[key].some((row, i) =>
        row.some((value, j) => value !== original[key][i]?.[j]),
      ),
  )
  const generation = useMutation(matrixVerificationMutations.generate())
  const verification = useMutation(matrixVerificationMutations.solve())

  const regenerate = async () => {
    setTrials([])
    generation.reset()
    verification.reset()
    try {
      const generated = await generation.mutateAsync({ size })
      setProblem(generated)
      setOriginal(generated)
    } catch {
      const generated = generateLocalProblem(size)
      setProblem(generated)
      setOriginal(generated)
      generation.reset()
    }
  }

  const changeSize = (nextSize: number) => {
    setSize(nextSize)
    const generated = generateLocalProblem(nextSize)
    setProblem(generated)
    setOriginal(generated)
    setTrials([])
    verification.reset()
  }

  const toggleTamper = () => {
    if (tampered) {
      setProblem(original)
    } else {
      const rowIndex = Math.floor(Math.random() * problem.product.length)
      const columnIndex = Math.floor(Math.random() * problem.product.length)
      setProblem((current) => {
        const product = current.product.map((row) => [...row])
        const row = product[rowIndex]
        const value = row?.[columnIndex]
        if (!row || value === undefined) return current
        row[columnIndex] = value === 0 ? 1 : 0
        return { ...current, product }
      })
    }
    setTrials([])
    verification.reset()
  }

  const changeCell = (
    matrix: keyof MatrixClaim,
    row: number,
    column: number,
    value: number,
  ) => {
    setProblem((current) => {
      const updated = current[matrix].map((values) => [...values])
      const targetRow = updated[row]
      if (!targetRow) return current
      targetRow[column] = value
      return { ...current, [matrix]: updated }
    })
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
  // Round upward so the displayed upper bound never understates the risk.
  const failureProbability = `${Math.ceil((100 / 2 ** rounds) * 10_000) / 10_000}%`

  return (
    <div className={shellStyles['lab-page']}>
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
      <div
        className={`${shellStyles['lab-layout']} ${shellStyles['section-wrap']}`}
      >
        <MatrixControls
          size={size}
          rounds={rounds}
          tampered={tampered}
          isGenerating={generation.isPending}
          isVerifying={verification.isPending}
          failureProbability={failureProbability}
          onSizeChange={changeSize}
          onRoundsChange={(value) => {
            setRounds(Math.max(1, Math.min(15, Math.round(value))))
            setTrials([])
            verification.reset()
          }}
          onGenerate={() => void regenerate()}
          onToggleTamper={toggleTamper}
          onVerify={() => void verify()}
        />
        <MatrixWorkspace
          problem={problem}
          original={original}
          trials={trials}
          disabled={generation.isPending || verification.isPending}
          onCellChange={changeCell}
        />
        <VerificationVerdict
          ariaLabel="Verification result"
          hasResult={trials.length > 0}
          accepted={accepted}
          idleTitle="Ready to verify"
          acceptedTitle="Claim accepted"
          rejectedTitle="Claim rejected"
          idleDescription="Run at least one randomized round."
          acceptedDescription={
            <span className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-2">
              <span>All {trials.length} checks matched.</span>
              <ErrorProbabilityNote
                rounds={rounds}
                probability={failureProbability}
              />
            </span>
          }
          rejectedDescription="A random vector exposed the incorrect product."
        />
      </div>
    </div>
  )
}
