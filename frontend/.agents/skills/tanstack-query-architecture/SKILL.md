---
name: tanstack-query-architecture
description: Design or refactor TanStack Query v5 queries, query keys, query option factories, status handling, data transformation, and TypeScript inference. Use for server-state reads and cache architecture; use the mutation or router integration skill for those specialized workflows.
metadata:
  source: https://github.com/TkDodo/blog/tree/15811fe6ea92db66e22976b54ad935fd8967d2f8/content/posts
---

# TanStack Query Architecture

Model remote data as server state: the cache owns snapshots from the server, while React state owns local UI choices and editable drafts. Do not copy query data into local state unless intentionally creating a one-time form draft.

## Query definitions

- Co-locate each query definition with its feature and API function.
- Prefer a `queryOptions` factory over a custom hook that only forwards to `useQuery`. The same typed object can be used by components, route loaders, prefetching, and cache operations.
- Let the API function's explicit promise return type flow through `queryOptions`; avoid manual generics and casts at call sites.
- Validate untrusted responses in the query function so cached data has the promised runtime shape.
- Put every value read by `queryFn` into `queryKey`. Treat the key like a dependency list.
- Use array keys ordered from broad to specific. Build feature factories with prefixes suitable for fuzzy invalidation, for example `all`, `lists`, `list(filters)`, `details`, and `detail(id)`.

## Cache and rendering decisions

- Keep the defaults unless product semantics justify changing them. Change `staleTime` to express freshness; do not use `gcTime` as a freshness control.
- Read query state in this order when stale data remains useful: render `data` first, then the initial pending state, then the no-data error state. A background error should not replace usable cached data.
- Choose transformations deliberately: prefer the backend when possible, use the query function when every consumer wants the same shape, and use `select` for observer-specific projections.
- Use `isFetching` for background activity and `isPending` for the first no-data load. Do not conflate the two.
- Keep query results immutable. Use `setQueryData` only for server-derived mutation responses or a deliberate optimistic update, never as a general local state store.
- Add Query Devtools in development when they materially help inspect keys, freshness, observers, and background fetches.

## Abstraction boundary

Expose the smallest abstraction that preserves inference. Do not accept a wide `UseQueryOptions` bag just to make a wrapper configurable; compose or spread a concrete `queryOptions` result at the usage site instead. A custom hook is justified when it adds behavior beyond forwarding options, such as combining queries or memoized derived state.

## Sources

Synthesized from TkDodo's pinned articles: [Practical React Query](https://github.com/TkDodo/blog/blob/15811fe6ea92db66e22976b54ad935fd8967d2f8/content/posts/practical-react-query/index.mdx), [Effective React Query Keys](https://github.com/TkDodo/blog/blob/15811fe6ea92db66e22976b54ad935fd8967d2f8/content/posts/effective-react-query-keys/index.mdx), [React Query Data Transformations](https://github.com/TkDodo/blog/blob/15811fe6ea92db66e22976b54ad935fd8967d2f8/content/posts/react-query-data-transformations/index.mdx), [Status Checks in React Query](https://github.com/TkDodo/blog/blob/15811fe6ea92db66e22976b54ad935fd8967d2f8/content/posts/status-checks-in-react-query/index.mdx), [Type-safe React Query](https://github.com/TkDodo/blog/blob/15811fe6ea92db66e22976b54ad935fd8967d2f8/content/posts/type-safe-react-query/index.mdx), [The Query Options API](https://github.com/TkDodo/blog/blob/15811fe6ea92db66e22976b54ad935fd8967d2f8/content/posts/the-query-options-api/index.mdx), and [Creating Query Abstractions](https://github.com/TkDodo/blog/blob/15811fe6ea92db66e22976b54ad935fd8967d2f8/content/posts/creating-query-abstractions/index.mdx).
