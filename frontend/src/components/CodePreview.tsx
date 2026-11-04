import type { ReactNode } from 'react'

interface CodePreviewProps {
  label: string
  children: ReactNode
}

export function CodePreview({ label, children }: CodePreviewProps) {
  return (
    <div className="mt-5 rounded-md bg-[#f3f4ef] p-3">
      <span className="mb-2 block text-xs tracking-[0.14em] text-muted-foreground uppercase">
        {label}
      </span>
      <code className="font-mono text-xs leading-[1.7] wrap-anywhere text-[#657067]">
        {children}
      </code>
    </div>
  )
}
