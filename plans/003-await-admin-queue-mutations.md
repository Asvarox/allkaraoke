# Plan 003: Await admin queue mutations before navigating

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report. When done, update the status row for this plan in `plans/README.md`
> unless a reviewer told you they maintain the index.
>
> **Drift check (run first)**:
> `git diff --stat 8856a6671..HEAD -- src/routes/convert/convert-view.tsx src/routes/edit/edit.tsx tests/admin-shared-songs.spec.ts`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding. On a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P2
- **Effort**: S-M
- **Risk**: MED
- **Depends on**: `plans/001-regenerate-complete-shared-song-index.md`
- **Category**: bug
- **Planned at**: commit `8856a6671`, 2026-06-12

## Why this matters

The admin queue lets a maintainer process the oldest shared songs one after
another. In queue mode, save and delete currently compute the next URL, fire the
mutation in the background, and navigate immediately. If the mutation fails, the
admin has already moved to the next song and sees only a console error, so the
failed record can remain unprocessed or be processed twice. This plan keeps the
queue flow but makes navigation happen only after the save/delete completes.

## Current state

- `src/routes/convert/convert-view.tsx` saves admin edits from the conversion
  flow.
- `src/routes/edit/edit.tsx` deletes admin shared songs from the edit page.
- `tests/admin-shared-songs.spec.ts` already has happy-path queue tests that
  poll until the background mutation lands.

Current excerpts:

```ts
// src/routes/convert/convert-view.tsx:213
const saveAdminSharedSong = async () => {
  await SongDao.store(finalSong!);
  await shareSong(finalSong!.id);
  await updateAdminSharedSong(adminSharedSongExternalId, finalSong!);
};

if (isAdminProcessingQueue) {
  const nextUrl = await getAdminProcessingQueueRedirect();
  void saveAdminSharedSong().catch((error) => {
    console.error('Failed to save admin shared song', error);
  });
  navigate(nextUrl);
  return;
}
```

```ts
// src/routes/edit/edit.tsx:49
if (isAdminProcessingQueue) {
  const songs = await listAdminSharedSongs(password);
  const nextUrl = getNextAdminSharedSongProcessingUrl(songs, adminSharedSongExternalId);

  void deleteAdminSharedSong(password, adminSharedSongExternalId).catch((error) => {
    console.error('Failed to delete admin shared song', error);
  });
  navigate(nextUrl);
  return;
}
```

Existing queue E2E pattern:

```ts
// tests/admin-shared-songs.spec.ts:134
test('saving during oldest-first processing redirects to the next unverified shared song', async ({
  page,
  request,
}, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium', 'Oldest-first queue tests share one KV namespace.');
```

Repo conventions to match:

- Playwright tests use page objects from `tests/page-objects/`.
- Admin queue tests in `tests/admin-shared-songs.spec.ts` run serially and skip
  non-Chromium queue cases because they share one KV namespace.
- React Compiler is enabled; do not add manual memoization just to satisfy hook
  dependency concerns.

## Commands you will need

| Purpose | Command | Expected on success |
| --- | --- | --- |
| Typecheck | `pnpm type-check` | exit 0, no type errors |
| Admin E2E | `pnpm e2e -- --project=chromium tests/admin-shared-songs.spec.ts` | admin shared-songs spec passes |

If the E2E command cannot run in your environment because the dev server or
browser cannot start, report that explicitly and still run `pnpm type-check`.

## Scope

**In scope**:

- `src/routes/convert/convert-view.tsx`
- `src/routes/edit/edit.tsx`
- `tests/admin-shared-songs.spec.ts`
- Existing admin/shared-song page objects only if needed to express the test
  cleanly

**Out of scope**:

- Changing non-admin redirect save behavior in `convert-view.tsx`
- Reworking the editor stepper or metadata form
- Changing shared-song API endpoints
- Changing queue ordering logic

## Git workflow

- Branch suggestion: `advisor/003-await-admin-queue-mutations`
- Commit message style in this repo is short imperative text, for example
  `Test shared songs admin workflow`.
- Do not push or open a PR unless the operator explicitly asks.

## Steps

### Step 1: Await queue save before navigation

In `src/routes/convert/convert-view.tsx`, update the `isAdminProcessingQueue`
branch so it awaits `saveAdminSharedSong()` before `navigate(nextUrl)`.

Keep computing `nextUrl` before the save. That preserves the current queue
semantics: the next song is selected from the pre-save list excluding the
current external ID.

Target shape:

```ts
if (isAdminProcessingQueue) {
  const nextUrl = await getAdminProcessingQueueRedirect();
  await saveAdminSharedSong();
  navigate(nextUrl);
  return;
}
```

Let the existing outer `try/catch/finally` handle errors and `isSaving`.
Remove the queue-specific `console.error` background catch.

**Verify**: `pnpm type-check` exits 0.

### Step 2: Await queue delete before navigation

In `src/routes/edit/edit.tsx`, update the `isAdminProcessingQueue` branch so it
awaits `deleteAdminSharedSong(password, adminSharedSongExternalId)` before
`navigate(nextUrl)`.

Keep computing `nextUrl` before the delete, matching current behavior.

Target shape:

```ts
if (isAdminProcessingQueue) {
  const songs = await listAdminSharedSongs(password);
  const nextUrl = getNextAdminSharedSongProcessingUrl(songs, adminSharedSongExternalId);

  await deleteAdminSharedSong(password, adminSharedSongExternalId);
  navigate(nextUrl);
  return;
}
```

Let the existing catch show `global.alert(...)` on failure. Remove the
queue-specific `console.error` background catch.

**Verify**: `pnpm type-check` exits 0.

### Step 3: Tighten the queue E2E assertions

In `tests/admin-shared-songs.spec.ts`, update the two existing queue tests so
they no longer rely on polling after navigation to prove the previous mutation
eventually happened.

For the save test:

- Keep the existing journey.
- After clicking save and after the page has navigated to the next queued song,
  fetch `/admin/shared-songs` once.
- Assert the older song title is already the synced title.

For the delete test:

- Keep the existing journey.
- After delete and after the page has navigated to the next queued song, fetch
  `/admin/shared-songs` once.
- Assert the older external ID is absent.

It is acceptable to keep a short `expect.poll` around UI navigation if needed,
but do not poll the API mutation result. The regression this plan protects is
that navigation means the mutation is complete.

**Verify**:

```bash
pnpm e2e -- --project=chromium tests/admin-shared-songs.spec.ts
```

Expected: the admin shared-songs spec passes. If E2E cannot run locally, record
the failure reason and continue only after `pnpm type-check` passes.

### Step 4: Run final verification

Run:

```bash
pnpm type-check
pnpm e2e -- --project=chromium tests/admin-shared-songs.spec.ts
```

Expected: both commands exit 0 in an environment that can run Playwright.

## Test plan

- Modify the existing queue save and delete E2E tests in
  `tests/admin-shared-songs.spec.ts`.
- The tests should verify that after the UI moves to the next queued song, the
  previous song's mutation is already visible through the admin API.
- No new unit test is required because this is user-flow behavior across React
  and the admin API.

## Done criteria

- [ ] Queue-mode save awaits the admin shared-song save before navigating.
- [ ] Queue-mode delete awaits the admin shared-song delete before navigating.
- [ ] Queue branches no longer swallow mutation failures into `console.error`.
- [ ] Existing non-queue admin save/delete behavior is unchanged.
- [ ] `pnpm type-check` exits 0.
- [ ] `pnpm e2e -- --project=chromium tests/admin-shared-songs.spec.ts` passes,
  or the inability to run it is documented with the exact environment failure.
- [ ] No files outside the in-scope list and `plans/README.md` are modified.
- [ ] `plans/README.md` status row for plan 003 is updated.

## STOP conditions

Stop and report back if:

- The live queue branches no longer match the excerpts above.
- Awaiting the mutation reveals a product requirement that the queue must
  navigate optimistically even on save/delete failure.
- Fixing the E2E tests requires changing unrelated page-object architecture.
- The same failure also exists in a non-admin redirect flow and appears to
  require broad save-flow redesign.

## Maintenance notes

Future queue actions should follow the same rule: compute the next target first
if needed, complete the current mutation, then navigate. Reviewers should check
that error states are visible to the admin and that `isSaving` cannot remain
stuck when an awaited queue save fails.
