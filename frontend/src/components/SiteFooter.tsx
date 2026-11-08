import { ArrowUpRight } from 'lucide-react'

import { BrandMark } from './BrandMark'

export function SiteFooter() {
  return (
    <footer className="mx-auto w-[min(1260px,calc(100%-48px))] max-[620px]:w-[calc(100%-28px)] flex min-h-[92px] items-center gap-[18px] border-t border-border text-[0.7rem] text-[#777f78] max-[620px]:flex-wrap max-[620px]:py-6">
      <BrandMark />
      <p className="mr-auto max-[620px]:m-0 max-[620px]:w-[calc(100%_-_44px)]">
        Built to make the invisible work of algorithms visible.
      </p>
      <a
        href="https://lielalmog.com"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-0.5 whitespace-nowrap hover:text-primary"
        aria-label="About me (opens in a new tab)"
      >
        About me <ArrowUpRight aria-hidden="true" className="size-3.5" />
      </a>
      <span className="font-mono">React · TypeScript · Go</span>
    </footer>
  )
}
