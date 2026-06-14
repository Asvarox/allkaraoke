# Plan 001: Regenerate a complete shared-song index

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report. When done, update the status row for this plan in `plans/README.md`
> unless a reviewer told you they maintain the index.
>
> **Drift check (run first)**:
> `git diff --stat 8856a6671..HEAD -- functions/shared-songs-store.ts functions/shared-songs-store.test.ts functions/admin/shared-songs.test.ts`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding. On a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: M
- **Risk**: MED
- **Depends on**: none
- **Category**: bug
- **Planned at**: commit `8856a6671`, 2026-06-12

## Why this matters

Shared songs are stored as individual Cloudflare KV records and exposed through
a single cached index key. The current index regeneration scans only one KV list
page, so once the namespace has more keys than one page returns, the regenerated
index can silently omit records from public search and the admin list. The same
index key is also updated through read-modify-write helpers on every upsert,
update, and delete, which can lose entries under concurrent writes. This plan
keeps the existing public API shape while making full index rebuilds complete
and using rebuilds in admin/sync paths where correctness matters more than
incremental speed.

## Current state

- `functions/shared-songs-store.ts` defines the KV record shape, the index entry
  shape, incremental index helpers, and `regenerateIndex`.
- `functions/shared-songs-store.test.ts` is the focused Cloudflare worker-pool
  test file for store behavior.
- `functions/admin/shared-songs.test.ts` verifies the browser admin endpoint that
  exposes index regeneration.

Current excerpts:

```ts
// functions/shared-songs-store.ts:43
const addToIndex = async (kvNamespace: KVNamespace, entry: SharedSongIndexEntry) => {
  const index = await getIndex(kvNamespace);
  const nextIndex = [...index.filter((song) => song.externalSongId !== entry.externalSongId), entry];
  await kvNamespace.put(INDEX_KEY, JSON.stringify(nextIndex));
};

// functions/shared-songs-store.ts:49
const removeFromIndex = async (kvNamespace: KVNamespace, externalSongId: string) => {
  const index = await getIndex(kvNamespace);
  await kvNamespace.put(INDEX_KEY, JSON.stringify(index.filter((song) => song.externalSongId !== externalSongId)));
};
```

```ts
// functions/shared-songs-store.ts:124
export const regenerateIndex = async (kvNamespace: KVNamespace) => {
  const listResponse = await kvNamespace.list({ prefix: SHARED_SONG_KEY_PREFIX });
  const records = await Promise.all(
    listResponse.keys.map(async ({ name }) => {
      const record = await kvNamespace.get<SharedSongRecord>(name, 'json');
      return record;
    }),
  );
```

Existing test pattern:

```ts
// functions/shared-songs-store.test.ts:63
it('regenerates the index with first seen timestamps', async () => {
  const kv = workerEnv.SHARED_SONGS_KV;
  await kv.put(
    'shared-song:external-1',
    JSON.stringify(generateSharedSongRecord({ externalSongId: 'external-1', firstSeenAt: 123 })),
  );

  await regenerateIndex(kv);
```

Repo conventions to match:

- Tests use Vitest with `cloudflare:test`, `workerEnv.SHARED_SONGS_KV`, and
  `afterEach(async () => { await reset(); })`.
- Shared-song functions return JSON and preserve the existing
  `SharedSongIndexEntry` response shape.
- Type checking uses `pnpm type-check`, not `tsc`.

## Commands you will need

| Purpose | Command | Expected on success |
| --- | --- | --- |
| Typecheck | `pnpm type-check` | exit 0, no type errors |
| Store tests | `pnpm test functions/shared-songs-store.test.ts` | 1 test file passes |
| Admin function tests | `pnpm test functions/admin/shared-songs.test.ts` | 1 test file passes |

Cloudflare/Vitest tests may need permission to bind localhost in restricted
sandboxes. If they fail with `listen EPERM 127.0.0.1`, rerun the same command in
an environment where localhost binding is allowed.

## Scope

**In scope**:

- `functions/shared-songs-store.ts`
- `functions/shared-songs-store.test.ts`
- `functions/admin/shared-songs.test.ts`

**Out of scope**:

- Public endpoint response shape in `functions/shared-songs.ts`
- Browser admin UI files under `src/routes/admin/`
- CI workflow YAML and PostHog import scripts
- Any migration away from Cloudflare KV

## Git workflow

- Branch suggestion: `advisor/001-regenerate-complete-shared-song-index`
- Commit message style in this repo is short imperative text, for example
  `Add admin shared song processing queue`.
- Do not push or open a PR unless the operator explicitly asks.

## Steps

### Step 1: Add a store test for paginated KV listing

In `functions/shared-songs-store.test.ts`, add a test near the existing
`regenerates the index with first seen timestamps` test. The Cloudflare
worker-pool KV mock may not expose pagination controls, so use a minimal fake
object for this unit-level behavior.

Create a fake `KVNamespace` object with:

- `list`: returns two pages for `{ prefix: 'shared-song:' }`, the first with
  one key and a cursor, the second with one key and no cursor.
- `get`: returns JSON records for the two key names.
- `put`: captures the value written to `shared-songs-index`.

Assert that after `await regenerateIndex(fakeKv)`, the captured index contains
both records, not only the first page.

Keep the fake local to this test file. Cast it to `unknown as KVNamespace`
instead of weakening production types.

**Verify**: `pnpm test functions/shared-songs-store.test.ts` should fail before
the production change because only the first page is indexed.

### Step 2: Make `regenerateIndex` follow KV cursors

Update `regenerateIndex` in `functions/shared-songs-store.ts` so it loops until
KV listing is complete. Cloudflare KV list responses expose keys and may include
pagination metadata such as `cursor` and `list_complete`. Use a defensive loop:

- Start with `cursor: undefined`.
- Call `kvNamespace.list({ prefix: SHARED_SONG_KEY_PREFIX, cursor })`.
- Append the returned `keys`.
- Stop when `list_complete === true` or no `cursor` is returned.
- Continue when a cursor is returned and the list is not complete.

Then fetch all records from the complete key list and write the index as it does
today. Do not change `SharedSongIndexEntry`.

**Verify**: `pnpm test functions/shared-songs-store.test.ts` should pass,
including the new pagination test.

### Step 3: Reduce read-modify-write index loss in mutating helpers

Keep writing individual records in `upsertSharedSong`, `updateSharedSong`, and
`removeSharedSong`, but replace the incremental index edits after those writes
with `await regenerateIndex(kvNamespace)`.

Expected production shape:

- `upsertSharedSong`: put the record, then regenerate the index.
- `updateSharedSong`: put the updated record, then regenerate the index.
- `removeSharedSong`: delete the record if it exists, then regenerate the
  index. If the record does not exist, still regenerate so stale index entries
  are cleaned.

After this change, remove private helpers that are no longer used
(`addToIndex`, `removeFromIndex`) unless a TypeScript compile proves they are
still needed.

**Verify**:

- `pnpm test functions/shared-songs-store.test.ts` exits 0.
- `pnpm test functions/admin/shared-songs.test.ts` exits 0.

### Step 4: Add a regression test for stale index cleanup

In `functions/shared-songs-store.test.ts`, add or extend a test showing that
calling `removeSharedSong(kv, 'missing-id')` removes stale index entries after a
regeneration. Seed:

- a stale `shared-songs-index` entry for `missing-id`
- no corresponding `shared-song:missing-id` record

Call `removeSharedSong(kv, 'missing-id')`, assert it returns `false`, and assert
`listSharedSongs(kv)` no longer includes `missing-id`.

This test should pass with the new regeneration-based implementation.

**Verify**: `pnpm test functions/shared-songs-store.test.ts` exits 0.

### Step 5: Run final verification

Run:

```bash
pnpm type-check
pnpm test functions/shared-songs-store.test.ts
pnpm test functions/admin/shared-songs.test.ts
```

Expected: all commands exit 0.

## Test plan

- Add one store test for multi-page `regenerateIndex`.
- Add one store test for stale index cleanup when deleting a missing record.
- Keep existing tests for stable external IDs, first-seen timestamps, update,
  and normal removal passing.
- Re-run the browser admin shared-songs function test because its `PUT` endpoint
  calls `regenerateIndex`.

## Done criteria

- [ ] `regenerateIndex` lists all KV pages for `shared-song:` records.
- [ ] Upsert, update, and delete paths no longer do index read-modify-write
  updates directly.
- [ ] New pagination and stale-index regression tests exist and pass.
- [ ] `pnpm type-check` exits 0.
- [ ] `pnpm test functions/shared-songs-store.test.ts` exits 0.
- [ ] `pnpm test functions/admin/shared-songs.test.ts` exits 0.
- [ ] No files outside the in-scope list and `plans/README.md` are modified.
- [ ] `plans/README.md` status row for plan 001 is updated.

## STOP conditions

Stop and report back if:

- The live `regenerateIndex`, `upsertSharedSong`, `updateSharedSong`, or
  `removeSharedSong` implementations no longer match the excerpts above.
- Cloudflare KV types in this repo do not expose enough list pagination fields
  to implement the cursor loop without unsafe broad `any` casts.
- Rebuilding the whole index on every mutation is found to exceed Cloudflare
  limits for the expected shared-song volume.
- A fix appears to require changing public shared-song API response shapes.

## Maintenance notes

This plan intentionally favors correctness over write throughput. If shared
songs grow large enough that full index rebuilds on every admin mutation become
too slow, revisit the index design with a stronger consistency mechanism rather
than returning to blind read-modify-write on one KV key. Reviewers should check
that pagination termination cannot loop forever when a malformed fake or runtime
response returns the same cursor repeatedly.
