import shellStyles from '../../styles/shell.module.css'
import { useMutation } from '@tanstack/react-query'
import { useCallback, useEffect, useRef, useState } from 'react'
import { ConceptExplainer } from '../../components/ConceptExplainer'
import { LabHeader } from '../../components/LabHeader'
import { VerificationVerdict } from '../../components/VerificationVerdict'
import type { PolynomialCheck } from '../../lib/api'
import { PolynomialControls } from './components/PolynomialControls'
import { PolynomialWorkspace } from './components/PolynomialWorkspace'
import { polynomialIdentityMutations } from './mutations'
import { prime, randomCoefficients, verifyLocally } from './polynomialIdentity'

export function PolynomialIdentityPage() {
  const [degree, setDegree] = useState(4)
  const [rounds, setRounds] = useState(4)
  const [left, setLeft] = useState(() => randomCoefficients(4))
  const [right, setRight] = useState(() => [...left])
  const [checks, setChecks] = useState<PolynomialCheck[]>([])
  const didGenerate = useRef(false)
  const generation = useMutation(polynomialIdentityMutations.generate())
  const verification = useMutation(polynomialIdentityMutations.solve())

  const generate = useCallback(
    async (requestedDegree = degree) => {
      setChecks([])
      generation.reset()
      verification.reset()
      try {
        const identity = await generation.mutateAsync({
          degree: requestedDegree,
        })
        setLeft(identity.left)
        setRight(identity.right)
      } catch {
        const coefficients = randomCoefficients(requestedDegree)
        setLeft(coefficients)
        setRight([...coefficients])
        generation.reset()
      }
    },
    [degree, generation, verification],
  )

  useEffect(() => {
    if (didGenerate.current) return
    didGenerate.current = true
    void generate()
  }, [generate])

  const changeDegree = (nextDegree: number) => {
    setDegree(nextDegree)
    void generate(nextDegree)
  }

  const alter = () => {
    setRight((current) => {
      const next = [...current]
      const index = Math.floor(Math.random() * next.length)
      const coefficient = next[index]
      if (coefficient === undefined) return current
      next[index] = (coefficient + 1 + Math.floor(Math.random() * 9)) % prime
      return next
    })
    setChecks([])
    verification.reset()
  }

  const verify = async () => {
    verification.reset()
    setChecks([])
    try {
      const result = await verification.mutateAsync({
        identity: { left, right },
        rounds,
      })
      setChecks(result.checks)
    } catch {
      setChecks(verifyLocally(left, right, rounds))
      verification.reset()
    }
  }

  const updateCoefficient = (
    side: 'left' | 'right',
    index: number,
    value: number,
  ) => {
    const setter = side === 'left' ? setLeft : setRight
    setter((current) =>
      current.map((coefficient, position) =>
        position === index ? value : coefficient,
      ),
    )
    setChecks([])
    verification.reset()
  }

  const identical = checks.length > 0 && checks.every((check) => check.passed)
  const disabled = generation.isPending || verification.isPending

  return (
    <div className={shellStyles['lab-page']}>
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
      <div
        className={`${shellStyles['lab-layout']} ${shellStyles['section-wrap']}`}
      >
        <PolynomialControls
          degree={degree}
          rounds={rounds}
          isGenerating={generation.isPending}
          isVerifying={verification.isPending}
          onDegreeChange={changeDegree}
          onRoundsChange={setRounds}
          onGenerate={() => void generate()}
          onAlter={alter}
          onVerify={() => void verify()}
        />
        <PolynomialWorkspace
          left={left}
          right={right}
          checks={checks}
          disabled={disabled}
          onCoefficientChange={updateCoefficient}
        />
        <VerificationVerdict
          ariaLabel="Identity result"
          hasResult={checks.length > 0}
          accepted={identical}
          idleTitle="Ready to verify"
          acceptedTitle="Identity accepted"
          rejectedTitle="Not an identity"
          idleDescription="Choose the number of rounds and start the test."
          acceptedDescription={`P and Q matched at all ${rounds} sampled points.`}
          rejectedDescription="One evaluation was enough to prove P and Q differ."
        />
      </div>
    </div>
  )
}
