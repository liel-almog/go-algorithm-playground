import { Link, Outlet, createRootRoute } from '@tanstack/react-router'

import '../styles.css'
import { BrandMark } from '../components/BrandMark'

export const Route = createRootRoute({
  component: RootComponent,
})

function RootComponent() {
  return (
    <div className="site-shell">
      <header className="site-header">
        <Link to="/" className="brand" aria-label="Algo Studio home">
          <BrandMark />
          <span>Algo Studio</span>
        </Link>
        <nav aria-label="Main navigation">
          <Link to="/" activeOptions={{ exact: true }}>
            Library
          </Link>
          <Link to="/" hash="workflow">
            Method
          </Link>
        </nav>
      </header>
      <main>
        <Outlet />
      </main>
      <footer className="site-footer">
        <BrandMark />
        <p>Built to make the invisible work of algorithms visible.</p>
        <span>React · TypeScript · Go</span>
      </footer>
    </div>
  )
}
