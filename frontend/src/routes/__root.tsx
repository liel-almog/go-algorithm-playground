import shellStyles from '../styles/shell.module.css'
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
    <div className="min-h-screen overflow-hidden">
      <header
        className={`${shellStyles['site-header']} flex h-20 items-center justify-between border-b border-border max-[620px]:h-[68px]`}
      >
        <Link
          to="/"
          className="inline-flex items-center gap-3 text-[1.05rem] font-bold tracking-[-0.04em]"
          aria-label="Algo Studio home"
        >
          <BrandMark />
          <span>Algo Studio</span>
        </Link>
        <nav
          className="flex gap-[30px] text-[0.86rem] font-semibold text-[#657069]"
          aria-label="Main navigation"
        >
          <Link to="/" activeOptions={{ exact: true }}>
            Library
          </Link>
          <Link to="/" hash="workflow" className="max-[620px]:hidden">
            Method
          </Link>
        </nav>
      </header>
      <main>
        <Outlet />
      </main>
      <footer
        className={`${shellStyles['site-footer']} flex min-h-[92px] items-center gap-[18px] border-t border-border text-[0.7rem] text-[#777f78] max-[620px]:flex-wrap max-[620px]:py-6`}
      >
        <BrandMark />
        <p className="mr-auto max-[620px]:m-0 max-[620px]:w-[calc(100%_-_44px)]">
          Built to make the invisible work of algorithms visible.
        </p>
        <span className="font-['DM_Mono']">React · TypeScript · Go</span>
      </footer>
    </div>
  )
}
