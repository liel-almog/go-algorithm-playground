import { useEffect, useState } from 'react'

const playbackDelayMs = 650

export function usePuzzlePlayback(frameCount: number) {
  const [step, setStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const lastStep = Math.max(0, frameCount - 1)

  useEffect(() => {
    if (!isPlaying || frameCount === 0) return
    if (step >= lastStep) {
      setIsPlaying(false)
      return
    }
    const timer = window.setTimeout(
      () => setStep((current) => current + 1),
      playbackDelayMs,
    )
    return () => window.clearTimeout(timer)
  }, [frameCount, isPlaying, lastStep, step])

  const reset = () => {
    setStep(0)
    setIsPlaying(false)
  }

  const previousStep = () => {
    setIsPlaying(false)
    setStep((current) => Math.max(0, current - 1))
  }

  const nextStep = () => {
    setIsPlaying(false)
    setStep((current) => Math.min(lastStep, current + 1))
  }

  const togglePlayback = () => {
    if (frameCount === 0) return
    if (step === lastStep) setStep(0)
    setIsPlaying((current) => !current)
  }

  return { step, isPlaying, reset, previousStep, nextStep, togglePlayback }
}
