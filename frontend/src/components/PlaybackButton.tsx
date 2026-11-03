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
          ? 'size-[31px] rounded-full border-primary bg-primary p-0 text-[0.7rem] text-primary-foreground shadow-none hover:shadow-none disabled:opacity-35'
          : 'size-[31px] rounded-full border border-[#dce0da] bg-[#f6f7f3] text-[0.7rem] disabled:opacity-35'
      }
      {...props}
    />
  )
}
