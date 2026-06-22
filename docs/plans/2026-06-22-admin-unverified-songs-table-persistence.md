# Admin Unverified Songs Table Persistence Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Persist the admin unverified songs table sort order and records-per-page setting in local storage so they survive reloads and later visits.

**Architecture:** Make the unverified songs admin table controlled for `sorting` and `pagination`, read the initial values from a dedicated local-storage key, and write back only the persisted subset when those settings change. Extend the existing Playwright admin page object with page-size and sort assertions, then add a reload-based regression test.

**Tech Stack:** React, TypeScript, Material React Table, browser `localStorage`, Playwright

---

### Task 1: Add persisted table state helpers

**Files:**

- Modify: `src/routes/admin/unverified-song-management.tsx`

**Step 1: Define the persisted state shape**

Add a small local type for the persisted payload with `sorting` and `pageSize`, plus one admin-specific storage key constant near the top of the file.

**Step 2: Add safe storage read/write helpers**

Implement helper functions that guard for SSR, parse JSON safely, validate the saved structure, and return default values when the stored value is absent or malformed.

### Task 2: Control MRT sorting and pagination

**Files:**

- Modify: `src/routes/admin/unverified-song-management.tsx`

**Step 1: Initialize React state from storage**

Create `sorting` and `pagination` state values from the storage helper so the first render uses persisted preferences.

**Step 2: Persist updates**

Add an effect that writes the current `sorting` and `pagination.pageSize` back to local storage whenever either changes.

**Step 3: Wire the table to controlled state**

Pass `sorting` and `pagination` into `MaterialReactTable`, provide `onSortingChange` and `onPaginationChange`, and keep the existing loading state and defaults intact.

### Task 3: Extend Playwright table controls

**Files:**

- Modify: `tests/page-objects/admin-unverified-songs-table.ts`
- Modify: `tests/page-objects/admin-unverified-songs-page.ts` only if shared admin-page helpers are needed

**Step 1: Add page-size controls**

Add helpers to open the rows-per-page selector and choose a new value using accessible locators that match the MUI pagination UI.

**Step 2: Add sort-state assertions**

Add a helper that can assert the current sort affordance for the `Added` column after reload, without relying on fragile row ordering alone.

### Task 4: Add reload persistence coverage

**Files:**

- Modify: `tests/admin-unverified-songs.spec.ts`

**Step 1: Add a focused persistence test**

Write a Playwright scenario that seeds enough songs to expose multiple pages, changes the page size, sorts by `Added`, reloads `/admin`, and verifies that both the selected page size and the sort state are preserved.

**Step 2: Keep cleanup explicit**

Track any additional seeded shared-song IDs in the existing cleanup array so the new test leaves the KV namespace clean.

### Task 5: Verify the change

**Files:**

- Modify: touched files above only if follow-up fixes are needed

**Step 1: Run the targeted Playwright file**

Run: `pnpm playwright test tests/admin-unverified-songs.spec.ts`

Expected: the admin suite passes, including the new reload persistence scenario.

**Step 2: Run type checking**

Run: `pnpm type-check`

Expected: no new type errors from the controlled table state or page object additions.

**Step 3: Commit when requested**

If the user wants a commit after review, stage the updated source, tests, and the two plan documents together with a focused feature commit message.
