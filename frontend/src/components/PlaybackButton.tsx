import type { ComponentProps } from 'react'
import { Button } from './ui/button'

type PlaybackButtonProps = ComponentProps<typeof Button> & { primary?: boolean }

export function PlaybackButton({
  primary = false,
  ...props
}: PlaybackButtonProps) {
  return (
    <Button
      variant={primary ? 'default' : 'secondary'}
      size="icon"
      className={
        primary
          ? 'size-11 rounded-full border-primary bg-primary p-0 text-primary-foreground shadow-[0_3px_0_#174a37,0_6px_12px_#2c684e20] hover:shadow-[0_4px_0_#123d2e,0_8px_16px_#2c684e30] active:shadow-none disabled:opacity-35 max-[620px]:size-11'
          : 'size-11 rounded-full border border-[#cfdbd0] bg-white text-secondary-foreground shadow-[0_2px_0_#d4ded3] hover:border-[#adc7b4] hover:bg-[#e8f1e7] active:shadow-none disabled:opacity-35 max-[620px]:size-11'
      }
      {...props}
    />
  )
}
