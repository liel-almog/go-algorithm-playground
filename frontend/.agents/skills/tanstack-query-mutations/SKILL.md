---
name: tanstack-query-mutations
description: Implement TanStack Query v5 mutations, invalidation, mutation keys, mutation callbacks, imperative workflows, and optimistic updates. Use for user-triggered server writes or commands, not ordinary server-state reads.
metadata:
  source: https://github.com/TkDodo/blog/tree/15811fe6ea92db66e22976b54ad935fd8967d2f8/content/posts
---

# TanStack Query Mutations

Use mutations for imperative, user-triggered server commands. A POST is not automatically a mutation: choose by semantics. Stable resource reads belong in queries; commands, writes, and explicitly triggered computations belong in mutations.

## Definitions and usage

- Co-locate the mutation function, `mutationKey`, and `mutationOptions` factory with the feature.
- Give mutation functions a single variables object when they need multiple values. This keeps the call stable as inputs grow.
- Put cache consistency rules in the mutation definition. Put UI-only effects such as navigation, closing a dialog, or a toast in per-call callbacks when they belong to that invocation.
- Prefer `mutate` for callback-driven UI. Use `mutateAsync` only when the caller genuinely needs promise composition, sequencing, or a `try/catch` fallback.
- Derive pending and error UI from the mutation result instead of mirroring it into React state. Call `reset` when starting a fresh workflow if an old error or result must be cleared.

## Cache consistency

- Mutations and queries are not coupled automatically. After success, either invalidate affected query prefixes or write the exact server response into the matching cache entry.
- Return or await invalidation only when the mutation must remain pending until the refreshed data is ready. Fire-and-forget broader invalidation when the UI need not wait.
- Prefer correctness over overly clever fine-grained invalidation. Fuzzy prefix invalidation refetches active matches and only marks inactive matches stale.
- Use a `mutationKey` when mutations need defaults, filtering, scoped invalidation, or concurrency checks.

## Optimistic updates

Use optimistic updates only when reproducing the server result on the client is simple and valuable. Before writing optimistically, cancel conflicting queries. Snapshot enough state to roll back on error, and reconcile with the server afterward.

For concurrent related mutations, avoid invalidating after every completion if an equivalent mutation is still running. At settlement time, inspect `queryClient.isMutating({ mutationKey })` imperatively and invalidate when the current mutation is the last matching one. Keep this optimization scoped by `mutationKey`; a global count can skip unrelated refreshes.

## Error handling

Handle expected, actionable errors next to the control that triggered them. Reserve global `MutationCache` callbacks for truly global behavior such as monitoring or a single generic notification. Do not duplicate the same notification at global, hook, and per-call levels.

## Sources

Synthesized from TkDodo's pinned articles: [Mastering Mutations in React Query](https://github.com/TkDodo/blog/blob/15811fe6ea92db66e22976b54ad935fd8967d2f8/content/posts/mastering-mutations-in-react-query/index.mdx), [React Query Error Handling](https://github.com/TkDodo/blog/blob/15811fe6ea92db66e22976b54ad935fd8967d2f8/content/posts/react-query-error-handling/index.mdx), [Automatic Query Invalidation after Mutations](https://github.com/TkDodo/blog/blob/15811fe6ea92db66e22976b54ad935fd8967d2f8/content/posts/automatic-query-invalidation-after-mutations/index.mdx), and [Concurrent Optimistic Updates in React Query](https://github.com/TkDodo/blog/blob/15811fe6ea92db66e22976b54ad935fd8967d2f8/content/posts/concurrent-optimistic-updates-in-react-query/index.mdx).
