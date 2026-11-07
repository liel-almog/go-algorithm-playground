# Algorithm Playground frontend

A React and TypeScript SPA using Vite, TanStack Router, TanStack Query, Zod,
and Tailwind CSS. The Go API lives in `../backend`.

## Development

The development server runs at `http://localhost:3000`. Respect `AGENTS.md`:
the servers are already running; do not start or restart them from an agent
session.

API requests default to `https://api.algorithms.lielalmog.com/api`. Set
`VITE_API_BASE_URL` at build time to override that URL, and allow the frontend
origin in the backend's `CORS_ALLOWED_ORIGINS` setting.
The production build uses `.env.production` for that API URL. `npm run deploy`
builds the frontend before uploading it to Cloudflare.

## Checks

Run from this directory:

```sh
npm run typecheck
npm run lint
npm run check
npm run build
```

`npm run format` formats application sources and configuration. Generated routes,
build output, lockfiles, and vendored skills are excluded from formatting.
Do not create tests for this repository.

## Structure and conventions

- `src/routes` defines file routes, redirects, and parameter validation. The Vite
  Router plugin generates `src/routeTree.gen.ts`; do not edit that file manually.
- `src/router.tsx` creates the QueryClient and provides it through router context
  and QueryClientProvider. Router preloading delegates freshness to Query.
- `src/features` owns each lab's components, mutation options, and query options.
  Server results and request state belong to Query; editable inputs and playback
  state belong to React. Reset results when their inputs change.
- `src/lib/apiSchemas.ts` defines runtime request and response contracts and
  inferred TypeScript types. `src/services` groups API calls by problem and
  shares Axios configuration, error handling, and response validation.
- `src/components` contains shared accessible controls and Tailwind-based layout
  components. Keep styles on the elements they affect, use `cn` for conditional
  utilities, and use named variants for complex visual states. Extract repeated
  markup into focused components instead of duplicating long utility lists.
- `src/styles.css` owns Tailwind theme tokens, global defaults, reduced-motion
  handling, and animation keyframes. Component styling uses Tailwind utilities;
  there are no CSS modules. Keep genuinely dynamic values, such as board dimensions
  and playback progress, in inline styles rather than constructing class names.

Labs open with local examples. Explicit generation and solving actions call the
API and display failures; they do not silently substitute a browser calculation.
Deterministic puzzle solutions reuse a query keyed by all solver inputs, with a
five-minute inactive cache lifetime. Randomized verification is a mutation so
every run samples fresh randomness. Matrix verification supports 1–15 rounds in
a single request.

## Reading and extending a lab

Start with the feature's `*Page.tsx` for the UI composition, then its `hooks/`
directory for state and user actions. Keep transformations such as matrix cell
updates in the feature's plain TypeScript module. Pass named actions to controls
instead of embedding state transitions in JSX. Both puzzle screens share
`usePuzzlePlayback`, `usePuzzleSolution`, and `usePuzzleAlgorithms`; update these
hooks when changing behavior common to both screens.
