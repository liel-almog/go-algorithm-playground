import type { ComponentProps } from 'react'
import { cn } from '../../lib/utils'

function NativeSelect({ className, ...props }: ComponentProps<'select'>) {
  return (
    <select
      data-slot="native-select"
      className={cn(
        'h-[43px] w-full rounded-md border border-input bg-card px-3 text-[0.68rem] text-foreground outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    />
  )
}

export { NativeSelect }
