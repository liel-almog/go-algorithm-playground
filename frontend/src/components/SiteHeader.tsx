import { Link } from '@tanstack/react-router'
import { ArrowUpRight } from 'lucide-react'

import { BrandMark } from './BrandMark'

export function SiteHeader() {
  return (
    <header className="mx-auto w-[min(1260px,calc(100%-48px))] max-[620px]:w-[calc(100%-28px)] flex h-20 items-center justify-between border-b border-border max-[620px]:h-[68px]">
      <Link
        to="/"
        className="inline-flex items-center gap-3 text-[1.05rem] font-bold tracking-[-0.04em]"
        aria-label="Algo Studio home"
      >
        <BrandMark />
        <span>Algo Studio</span>
      </Link>
      <nav
        className="flex gap-[30px] text-[0.86rem] font-semibold text-[#657069] max-[400px]:gap-4"
        aria-label="Main navigation"
      >
        <Link
          to="/"
          activeOptions={{ exact: true }}
          className="relative py-7 after:absolute after:right-full after:bottom-[17px] after:left-0 after:h-0.5 after:bg-primary after:transition-[right] after:duration-200 after:ease-[ease] hover:after:right-0 [&.active]:after:right-0"
        >
          Library
        </Link>
        <Link
          to="/"
          hash="workflow"
          className="relative py-7 after:absolute after:right-full after:bottom-[17px] after:left-0 after:h-0.5 after:bg-primary after:transition-[right] after:duration-200 after:ease-[ease] hover:after:right-0 [&.active]:after:right-0 max-[620px]:hidden"
        >
          Method
        </Link>
        <a
          href="https://lielalmog.com"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-0.5 py-7 whitespace-nowrap hover:text-primary"
          aria-label="About me (opens in a new tab)"
        >
          About me <ArrowUpRight aria-hidden="true" className="size-4" />
        </a>
      </nav>
    </header>
  )
}
