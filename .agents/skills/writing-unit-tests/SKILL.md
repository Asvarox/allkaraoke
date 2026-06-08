---
name: writing-unit-tests
description: Use when Codex updates, fixes, or adds unit tests in this project. Covers basic unit test conventions, Vitest usage, and Cloudflare-related unit tests that should use Cloudflare's Vitest worker-pool integration instead of hand-rolled runtime mocks.
---

# Writing Unit Tests

## Basics

- Write unit tests with Vitest.
- Use `.test.ts` for TypeScript unit test files, and `.test.tsx` when the test uses React or JSX.
- Keep test files close to the code they cover when that matches the local structure.

## Shared Test Utilities

- Put small shared fixture generators in `functions/test-utils.ts` when multiple unit tests need the same record builders.
- Keep those helpers basic and easy to extend rather than building a large abstraction too early.

## Cloudflare Code

For tests that exercise Cloudflare Workers, Pages Functions, KV storage, or other Cloudflare runtime bindings:

- Prefer `@cloudflare/vitest-pool-workers` over hand-written mocks for Cloudflare bindings.
- Import runtime bindings from `cloudflare:workers`, for example `env.SHARED_SONGS_KV`.
- Use `cloudflare:test` helpers when needed, such as `reset()` for storage cleanup between tests.
- Keep Cloudflare tests in the Vitest project configured with the Cloudflare worker-pool plugin.

See [references/cloudflare-vitest-integration.md](references/cloudflare-vitest-integration.md) for the pasted Cloudflare guide.
