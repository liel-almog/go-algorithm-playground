---
name: tanstack-router-query
description: Integrate TanStack Query v5 with TanStack Router loaders, route context, prefetching, Suspense, errors, and SSR-safe router creation. Use when routes coordinate server-state fetching; do not use for Query without Router.
metadata:
  source: https://github.com/TkDodo/blog/tree/15811fe6ea92db66e22976b54ad935fd8967d2f8/content/posts
---

# TanStack Router + Query

Treat Router as the fetch coordinator and Query as the cache. Route loaders initiate work early; mounted Query observers own rendering, refetch behavior, invalidation, and cache lifetime.

## Setup

- Create one `QueryClient` per router instance and pass that exact instance both through router context and `QueryClientProvider`.
- Declare the context with `createRootRouteWithContext<{ queryClient: QueryClient }>()({...})`.
- Set `defaultPreloadStaleTime: 0` so Router's preload cache does not compete with Query freshness.
- In SSR-capable code, create the client inside the router factory to prevent cross-request cache leakage.

## Route workflow

- Define fetch inputs once with a feature-level `queryOptions` factory. Reuse the same factory in loaders and components so keys and functions cannot drift.
- Declare only data-affecting search parameters in `loaderDeps`; use those exact dependencies in the query options.
- Use the loader as an event handler that primes the cache. Read data in the component with `useQuery` or `useSuspenseQuery`, not `useLoaderData`, so Query retains an active observer.
- Fetch route-critical data early. Use `ensureQueryData`/`fetchQuery` when navigation must wait for a valid result. Use prefetching for work that may continue without blocking, and deliberately handle its rejected promise.
- Prefer `useSuspenseQuery` when route pending and error boundaries should handle the initial load. Use `useQuery` for non-blocking secondary data with an inline pending state.
- A route component should still work if prefetching is removed; the loader is a performance coordinator, not the sole owner of the data.

## Errors and freshness

Reset Query's error boundary when retrying a failed route query, then invalidate or reload the route so the loader runs again. Avoid returning cached loader data as a substitute for a Query observer; inactive queries lose focus/refetch and invalidation behavior and become eligible for garbage collection.

## Sources

Synthesized from TkDodo's pinned articles: [React Query meets React Router](https://github.com/TkDodo/blog/blob/15811fe6ea92db66e22976b54ad935fd8967d2f8/content/posts/react-query-meets-react-router/index.mdx), [TanStack Router and Query](https://github.com/TkDodo/blog/blob/15811fe6ea92db66e22976b54ad935fd8967d2f8/content/posts/tan-stack-router-and-query/index.mdx), and [Reliable Query Prefetching with TanStack Router](https://github.com/TkDodo/blog/blob/15811fe6ea92db66e22976b54ad935fd8967d2f8/content/posts/reliable-query-prefetching-with-tanstack-router/index.mdx).
