# Plan 002: Preserve first-seen timestamps on shared-song upsert

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report. When done, update the status row for this plan in `plans/README.md`
> unless a reviewer told you they maintain the index.
>
> **Drift check (run first)**:
> `git diff --stat 8856a6671..HEAD -- functions/shared-songs-store.ts functions/shared-songs-store.test.ts scripts/cicd/github-action-upload-shared-songs-to-cloudflare.ts`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding. On a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: S
- **Risk**: LOW
- **Depends on**: `plans/001-regenerate-complete-shared-song-index.md`
- **Category**: bug
- **Planned at**: commit `8856a6671`, 2026-06-12

## Why this matters

The scheduled shared-song sync reprocesses recent PostHog events every six
hours. The import script currently builds each upsert record with
`firstSeenAt: Date.now()`, and the store replaces the existing record wholesale.
That means repeated imports can make old songs look newly added and can reorder
the admin "oldest unverified" queue. This plan makes `firstSeenAt` stable after
the first insert while still updating the latest payload and `lastSeenAt`.

## Current state

- `scripts/cicd/github-action-upload-shared-songs-to-cloudflare.ts` transforms
  PostHog events into `SharedSongRecord` payloads.
- `functions/shared-songs-store.ts` owns record persistence and index entries.
- `functions/shared-songs-store.test.ts` already has a test that documents the
  current full-replacement behavior.

Current excerpts:

```ts
// scripts/cicd/github-action-upload-shared-songs-to-cloudflare.ts:223
const now = Date.now();
const record: SharedSongRecord = {
  externalSongId: song.id,
  songId: song.id,
  songTxt: convertSongToTxt(song),
  artist: song.artist,
  title: song.title,
  language: song.language,
  videoId: song.video,
  verifiedAt: now,
  firstSeenAt: now,
  lastSeenAt: now,
  sourceUserId: userId ?? '',
  sourceEventAt: new Date(createdAt).getTime(),
};
```

```ts
// functions/shared-songs-store.ts:63
export const upsertSharedSong = async (kvNamespace: KVNamespace, record: SharedSongRecord) => {
  const storageKey = getStorageKey(record.externalSongId);
  await kvNamespace.put(storageKey, JSON.stringify(record));
  await addToIndex(kvNamespace, {
    externalSongId: record.externalSongId,
    songId: record.songId,
```

```ts
// functions/shared-songs-store.test.ts:80
it('replaces record on upsert even when hash matches', async () => {
  const kv = workerEnv.SHARED_SONGS_KV;

  await upsertSharedSong(kv, generateSharedSongRecord({ songTxt: 'first', lastSeenAt: 100 }));
  await upsertSharedSong(
    kv,
    generateSharedSongRecord({
      songTxt: 'second',
      lastSeenAt: 200,
      sourceEventAt: 300,
      sourceUserId: 'user-2',
    }),
```

Repo conventions to match:

- Shared-song store tests live in `functions/shared-songs-store.test.ts` and use
  `generateSharedSongRecord` from `functions/test-utils.ts`.
- Keep the public `SharedSongRecord` type fields unchanged.
- Type checking uses `pnpm type-check`.

## Commands you will need

| Purpose | Command | Expected on success |
| --- | --- | --- |
| Typecheck | `pnpm type-check` | exit 0, no type errors |
| Store tests | `pnpm test functions/shared-songs-store.test.ts` | 1 test file passes |

Cloudflare/Vitest tests may need permission to bind localhost in restricted
sandboxes. If they fail with `listen EPERM 127.0.0.1`, rerun the same command in
an environment where localhost binding is allowed.

## Scope

**In scope**:

- `functions/shared-songs-store.ts`
- `functions/shared-songs-store.test.ts`
- `scripts/cicd/github-action-upload-shared-songs-to-cloudflare.ts` only if the
  store-level fix reveals the script needs to pass a different timestamp

**Out of scope**:

- Changing the PostHog query window or cursor behavior
- Re-enabling `unshare-song` deletion handling
- Changing admin queue UI sorting
- Changing the `SharedSongRecord` field names

## Git workflow

- Branch suggestion: `advisor/002-preserve-shared-song-first-seen`
- Commit message style in this repo is short imperative text, for example
  `Add first-seen dates to shared song admin index`.
- Do not push or open a PR unless the operator explicitly asks.

## Steps

### Step 1: Add a regression test for preserved first-seen metadata

In `functions/shared-songs-store.test.ts`, update the existing
`replaces record on upsert even when hash matches` test or add a neighboring
test. The test must prove all of these:

- Initial upsert stores `firstSeenAt: 100`.
- Second upsert for the same `externalSongId` passes `firstSeenAt: 999`,
  `lastSeenAt: 200`, `sourceEventAt: 300`, and a changed `songTxt`.
- Stored record keeps `firstSeenAt: 100`.
- Stored record updates `lastSeenAt`, `sourceEventAt`, `sourceUserId`, and
  `songTxt` from the second payload.
- `listSharedSongs(kv)` returns an entry with `firstSeenAt: 100`.

**Verify**: `pnpm test functions/shared-songs-store.test.ts` should fail before
the production change because first-seen is currently overwritten.

### Step 2: Preserve `firstSeenAt` inside `upsertSharedSong`

Update `upsertSharedSong` in `functions/shared-songs-store.ts` to fetch the
current record before writing. If a current record exists, write a merged record
that uses:

- all fields from the incoming `record`
- `firstSeenAt` from the existing record
- the incoming `lastSeenAt`, `sourceEventAt`, `sourceUserId`, and song content

If no current record exists, store the incoming record unchanged.

Keep index entries derived from the final stored record, not the raw incoming
record. If plan 001 has already replaced incremental index updates with
`regenerateIndex`, make sure the final stored record is written before
regeneration.

**Verify**: `pnpm test functions/shared-songs-store.test.ts` exits 0.

### Step 3: Check whether the import script needs no change

Read `scripts/cicd/github-action-upload-shared-songs-to-cloudflare.ts`.
If the store now preserves `firstSeenAt`, the script can continue to send
`firstSeenAt: now` for new records. Do not change the script unless tests or
types prove it is necessary.

If you do change the script, keep `lastSeenAt` as the current import time and
avoid adding network calls from the script to look up existing records.

**Verify**: `pnpm type-check` exits 0.

### Step 4: Run final verification

Run:

```bash
pnpm type-check
pnpm test functions/shared-songs-store.test.ts
```

Expected: both commands exit 0.

## Test plan

- Add or update one store test for second upsert preserving the original
  `firstSeenAt`.
- Keep existing tests for update, remove, regenerate, and replacement behavior
  passing.
- No E2E test is needed for this small store-level behavior.

## Done criteria

- [ ] Re-upserting an existing shared song preserves the stored `firstSeenAt`.
- [ ] Re-upserting still updates payload content, `lastSeenAt`, `sourceUserId`,
  and `sourceEventAt`.
- [ ] The shared-song index uses the preserved first-seen timestamp.
- [ ] `pnpm type-check` exits 0.
- [ ] `pnpm test functions/shared-songs-store.test.ts` exits 0.
- [ ] No files outside the in-scope list and `plans/README.md` are modified.
- [ ] `plans/README.md` status row for plan 002 is updated.

## STOP conditions

Stop and report back if:

- Plan 001 has not landed and your change would conflict with its index
  regeneration changes.
- The live `upsertSharedSong` implementation no longer matches the current
  excerpt closely enough to apply the merge safely.
- Product intent has changed and `firstSeenAt` is supposed to mean "last import
  processing time" rather than "first event seen".
- Preserving `firstSeenAt` requires changing the public record shape.

## Maintenance notes

Future import changes should treat `firstSeenAt` as immutable creation metadata
and `lastSeenAt` as the rolling freshness signal. Reviewers should scrutinize
that the second upsert still updates the song payload; preserving first-seen
must not accidentally freeze the entire record.
