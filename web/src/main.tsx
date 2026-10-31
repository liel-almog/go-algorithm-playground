import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider, createRootRoute, createRoute, createRouter } from '@tanstack/react-router'
import { AppShell, HomePage, PuzzlePage, GraphPage, AboutPage } from './pages'
import './styles.css'

const rootRoute = createRootRoute({ component: AppShell })
const indexRoute = createRoute({ getParentRoute: () => rootRoute, path: '/', component: HomePage })
const puzzleRoute = createRoute({ getParentRoute: () => rootRoute, path: '/puzzle', component: PuzzlePage })
const graphRoute = createRoute({ getParentRoute: () => rootRoute, path: '/graph', component: GraphPage })
const aboutRoute = createRoute({ getParentRoute: () => rootRoute, path: '/about', component: AboutPage })
const router = createRouter({ routeTree: rootRoute.addChildren([indexRoute, puzzleRoute, graphRoute, aboutRoute]) })

declare module '@tanstack/react-router' { interface Register { router: typeof router } }

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: 1, staleTime: 30_000 } } })

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode><QueryClientProvider client={queryClient}><RouterProvider router={router} /></QueryClientProvider></React.StrictMode>,
)
