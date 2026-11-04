import {
  Link,
  Outlet,
  createRootRouteWithContext,
} from '@tanstack/react-router'
import type { QueryClient } from '@tanstack/react-query'

import '../styles.css'
import { BrandMark } from '../components/BrandMark'

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient
}>()({
  component: RootComponent,
})

function RootComponent() {
  return (
    <div className="min-h-screen overflow-x-clip">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:bg-white focus:p-4 focus:text-primary"
      >
        Skip to content
      </a>
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
        </nav>
      </header>
      <main id="main-content" tabIndex={-1}>
        <Outlet />
      </main>
      <footer className="mx-auto w-[min(1260px,calc(100%-48px))] max-[620px]:w-[calc(100%-28px)] flex min-h-[92px] items-center gap-[18px] border-t border-border text-[0.7rem] text-[#777f78] max-[620px]:flex-wrap max-[620px]:py-6">
        <BrandMark />
        <p className="mr-auto max-[620px]:m-0 max-[620px]:w-[calc(100%_-_44px)]">
          Built to make the invisible work of algorithms visible.
        </p>
        <span className="font-mono">React · TypeScript · Go</span>
      </footer>
    </div>
  )
}
