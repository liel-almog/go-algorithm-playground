import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react'
import { PlaybackButton } from './PlaybackButton'

interface PuzzlePlaybackProps {
  hasResult: boolean
  step: number
  finalStep: number
  isPlaying: boolean
  moveLabel: string
  onPrevious: () => void
  onNext: () => void
  onTogglePlayback: () => void
}

export function PuzzlePlayback({
  hasResult,
  step,
  finalStep,
  isPlaying,
  moveLabel,
  onPrevious,
  onNext,
  onTogglePlayback,
}: PuzzlePlaybackProps) {
  const progressPercent = hasResult ? (step / Math.max(1, finalStep)) * 100 : 0

  return (
    <div className="flex min-h-[58px] items-center gap-2 border-t bg-[#fdfdfb] px-4.5 max-[620px]:grid max-[620px]:grid-cols-[repeat(3,44px)_minmax(0,1fr)] max-[620px]:px-3 max-[620px]:py-2.5">
      <PlaybackButton
        aria-label="Previous solution step"
        onClick={onPrevious}
        disabled={!hasResult || step === 0}
      >
        <ChevronLeft aria-hidden="true" className="size-5" />
      </PlaybackButton>
      <PlaybackButton
        primary
        aria-label={isPlaying ? 'Pause solution' : 'Play solution'}
        onClick={onTogglePlayback}
        disabled={!hasResult}
      >
        {isPlaying ? (
          <Pause aria-hidden="true" className="size-4 fill-current" />
        ) : (
          <Play aria-hidden="true" className="size-4 fill-current" />
        )}
      </PlaybackButton>
      <PlaybackButton
        aria-label="Next solution step"
        onClick={onNext}
        disabled={!hasResult || step === finalStep}
      >
        <ChevronRight aria-hidden="true" className="size-5" />
      </PlaybackButton>
      <div className="mx-2.5 h-[3px] flex-1 overflow-hidden rounded-[5px] bg-[#e2e5df] max-[620px]:order-last max-[620px]:col-span-full max-[620px]:mx-0 max-[620px]:mt-2 max-[620px]:mb-1">
        <span
          className="block h-full bg-orange transition-[width] duration-250 ease-[ease]"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
      <span className="min-w-[67px] text-right font-mono text-xs leading-[normal] text-[#7f8880]">
        {moveLabel}
      </span>
    </div>
  )
}
