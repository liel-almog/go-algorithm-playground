import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import { polynomialIdentityMutations } from '../mutations'
import { prime, randomCoefficients } from '../polynomialIdentity'

export function usePolynomialIdentity() {
  const [degree, setDegree] = useState(4)
  const [rounds, setRounds] = useState(4)
  const [left, setLeft] = useState(() => randomCoefficients(4))
  const [right, setRight] = useState(() => [...left])
  const generation = useMutation(polynomialIdentityMutations.generate())
  const verification = useMutation(polynomialIdentityMutations.solve())

  const checks = verification.data?.checks ?? []
  const generate = () => {
    verification.reset()
    generation.mutate(
      { degree },
      {
        onSuccess: (identity) => {
          setLeft(identity.left)
          setRight(identity.right)
        },
      },
    )
  }

  const changeDegree = (nextDegree: number) => {
    setDegree(nextDegree)
    const coefficients = randomCoefficients(nextDegree)
    setLeft(coefficients)
    setRight([...coefficients])
    verification.reset()
    generation.reset()
  }

  const alterCoefficient = () => {
    const index = Math.floor(Math.random() * right.length)
    const increment = 1 + Math.floor(Math.random() * 9)
    setRight((current) =>
      current.map((coefficient, position) =>
        position === index ? (coefficient + increment) % prime : coefficient,
      ),
    )
    verification.reset()
  }

  const verify = () => {
    generation.reset()
    verification.mutate({ identity: { left, right }, rounds })
  }

  const updateCoefficient = (
    side: 'left' | 'right',
    index: number,
    value: number,
  ) => {
    const setCoefficients = side === 'left' ? setLeft : setRight
    setCoefficients((current) =>
      current.map((coefficient, position) =>
        position === index ? value : coefficient,
      ),
    )
    verification.reset()
  }

  const accepted = checks.length > 0 && checks.every((check) => check.passed)
  const isBusy = generation.isPending || verification.isPending

  const changeRounds = (value: number) => {
    setRounds(value)
    verification.reset()
  }

  return {
    degree,
    rounds,
    left,
    right,
    checks,
    accepted,
    isBusy,
    hasResult: checks.length > 0,
    isGenerating: generation.isPending,
    isVerifying: verification.isPending,
    error: generation.error ?? verification.error,
    generate,
    changeDegree,
    changeRounds,
    alterCoefficient,
    updateCoefficient,
    verify,
  }
}
