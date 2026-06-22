# Admin Unverified Songs Table Persistence Design

## Goal

Persist the admin unverified songs table settings for sort order and records per page so the table reopens with the same operator preferences.

## Context

The `/admin` unverified songs screen uses `MaterialReactTable` in `src/routes/admin/unverified-song-management.tsx`. Today the table relies on the library's internal state, so sorting and page size reset after a refresh or a new visit.

The admin password already supports explicit storage behavior in `src/routes/admin/admin-password.ts`, and this change should follow the same browser-side persistence pattern without changing backend APIs.

## Chosen Approach

Control the table's `sorting` and `pagination.pageSize` state in React and persist those values in `localStorage` under a dedicated admin-table key.

Details:

- Persist only `sorting` and `pageSize`.
- Do not persist `pageIndex`.
- Hydrate the controlled state from `localStorage` on load.
- Update `localStorage` whenever sorting or page size changes.
- Fall back to sane defaults if the stored data is missing or malformed.

## Why This Approach

This keeps the persisted payload small, stable, and easy to test. Persisting the entire MRT state would also capture unrelated UI state and create tighter coupling to library internals. A generic persisted-state hook is possible, but the table state here is small enough that explicit serialization is clearer.

## Storage Behavior

Use `localStorage` rather than `sessionStorage` so settings survive refresh, logout, and reopening the browser. The settings are non-sensitive UI preferences, unlike the admin password which intentionally supports both session and remembered storage modes.

## Testing

Add one focused Playwright scenario that:

1. Signs into `/admin`
2. Changes records per page
3. Applies a non-default sort
4. Reloads the page
5. Verifies that both settings are restored
