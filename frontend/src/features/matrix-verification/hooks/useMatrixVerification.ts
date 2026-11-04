import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import type { MatrixClaim } from '../../../lib/api'
import {
  claimsDiffer,
  generateLocalProblem,
  updateMatrixCell,
} from '../matrixVerification'
import { matrixVerificationMutations } from '../mutations'

export function useMatrixVerification() {
  const [size, setSize] = useState(3)
  const [rounds, setRounds] = useState(5)
  const [claim, setClaim] = useState<MatrixClaim>(() => generateLocalProblem(3))
  const [originalClaim, setOriginalClaim] = useState(claim)
  const isTampered = claimsDiffer(claim, originalClaim)
  const generation = useMutation(matrixVerificationMutations.generate())
  const verification = useMutation(matrixVerificationMutations.solve())

  const trials = verification.data?.trials ?? []
  const generate = () => {
    verification.reset()
    generation.mutate(
      { size },
      {
        onSuccess: (generated) => {
          setClaim(generated)
          setOriginalClaim(generated)
        },
      },
    )
  }

  const changeSize = (nextSize: number) => {
    setSize(nextSize)
    generation.reset()
    const generated = generateLocalProblem(nextSize)
    setClaim(generated)
    setOriginalClaim(generated)
    verification.reset()
  }

  const toggleTamper = () => {
    if (isTampered) {
      setClaim(originalClaim)
    } else {
      const rowIndex = Math.floor(Math.random() * claim.product.length)
      const columnIndex = Math.floor(Math.random() * claim.product.length)
      const value = claim.product[rowIndex]?.[columnIndex]
      if (value !== undefined) {
        setClaim((current) =>
          updateMatrixCell(
            current,
            'product',
            rowIndex,
            columnIndex,
            value === 0 ? 1 : 0,
          ),
        )
      }
    }
    verification.reset()
  }

  const changeCell = (
    matrix: keyof MatrixClaim,
    row: number,
    column: number,
    value: number,
  ) => {
    setClaim((current) => updateMatrixCell(current, matrix, row, column, value))
    verification.reset()
  }

  const verify = () => {
    generation.reset()
    verification.mutate({ claim, rounds })
  }

  const accepted = trials.length > 0 && trials.every((trial) => trial.passed)
  const failurePercent = 100 / 2 ** rounds
  const decimalScale = 10_000
  // Round upward so the displayed upper bound never understates the risk.
  const roundedFailurePercent =
    Math.ceil(failurePercent * decimalScale) / decimalScale
  const failureProbability = `${roundedFailurePercent}%`

  const changeRounds = (value: number) => {
    setRounds(Math.max(1, Math.min(15, Math.round(value))))
    verification.reset()
  }

  return {
    size,
    rounds,
    claim,
    originalClaim,
    trials,
    isTampered,
    accepted,
    failureProbability,
    hasResult: trials.length > 0,
    isBusy: generation.isPending || verification.isPending,
    isGenerating: generation.isPending,
    isVerifying: verification.isPending,
    error: generation.error ?? verification.error,
    generate,
    changeSize,
    changeRounds,
    toggleTamper,
    changeCell,
    verify,
  }
}
