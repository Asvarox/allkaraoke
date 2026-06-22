# Shared Songs Hybrid Pipeline Implementation Plan

> For Claude: REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

Goal: Build a hybrid shared-song workflow where PostHog remains submission intake, GitHub Actions verifies and syncs shared songs into Cloudflare every 6 hours, and the app can discover, play, rate, and edit unverified songs.

Architecture: Keep the current share action unchanged and treat PostHog as source intake. A scheduled CI workflow processes event deltas, validates each candidate, and upserts searchable records into Cloudflare storage. Runtime search fetches from Cloudflare only as a fallback, while gameplay and editor both use the same single-song Cloudflare fetch endpoint for full song content.

Tech Stack: React 19, TypeScript, PostHog HogQL API, GitHub Actions, Cloudflare Pages Functions, IndexedDB SongDao, Vitest.

---

## 1. Scope and Final Behavior

In scope:

- Keep current share UI and share-song event unchanged
- Add scheduled CI verification and Cloudflare sync
- Show Cloudflare shared songs in Song Selection V2 only when regular result count is below 8
- Render shared songs as a separate result group below regular results
- Allow selecting and playing shared songs through the normal game path
- Add warning before playing an unverified song
- Force feedback after singing unverified songs regardless of completion percentage
- Emit separate PostHog event rate-unverified-song with explicit ok and bad states
- Support edit deep-link with externalSong query parameter
- Remove Cloudflare pending copies when songs are promoted into library by import workflow

Out of scope:

- New moderation dashboard
- New share UI
- Advanced moderation states beyond agreed checks

---

## 2. Source of Truth and Data Model

Submission source:

- PostHog share-song and unshare-song events remain the only submission intake.

Cloudflare shared-song record (suggested fields):

- sharedSongId: stable Cloudflare key for shared pool (recommend same as parsed song id)
- songId: parsed song id from txt
- songTxt: full UltraStar content
- songTxtHash: hash of normalized txt to detect exact duplicates
- artist, title, language, videoId: extracted fields for search cards
- validatedAt: timestamp of latest verification run
- verificationStatus: pending, valid, invalid
- verificationErrors: list of failed checks
- firstSeenAt, lastSeenAt: timestamps from PostHog processing
- sourceUserId: PostHog user id of latest submission
- sourceEventAt: timestamp of latest relevant event
- removedAt: timestamp when logically removed by unshare or promotion cleanup

Search publishability:

- Only records with verificationStatus valid and removedAt empty are returned to runtime search.

---

## 3. Duplicate and Conflict Handling Rules

### 3.1 Same song submitted multiple times

Case A: same songId and same songTxtHash

- Treat as idempotent duplicate.
- Update lastSeenAt and source metadata only.
- Do not create a new Cloudflare record.

Case B: same songId and different songTxtHash

- Treat as a new revision of same shared song.
- Keep one active record per songId.
- Upsert record with latest sourceEventAt and latest songTxt.
- Re-run verification and overwrite verification status.

Case C: different songId but semantically similar title and artist

- Treat as separate songs.
- No fuzzy dedupe in pipeline.

### 3.2 Unshare events

- If unshare-song arrives for songId, set removedAt and hide from runtime search.
- Keep record metadata for audit and replay safety.

### 3.3 Race conditions and ordering

- Always order event processing by created_at ascending.
- Use high-water mark cursor from last successful run.
- For equal timestamps, secondary sort by event uuid if available.
- Last processed event wins for final record state.

### 3.4 Conflicts with local and built-in index

- At runtime merge, if shared song id is already present in SongDao index (local or built-in), skip shared entry in fallback group.
- This prevents duplicate cards and prevents forcing shared-song rating mode for user-owned local versions.

---

## 4. Detailed Task Breakdown

### Task 1: Add shared-song metadata types

Files likely edited:

- Modify: src/interfaces.ts
- Create: src/modules/Songs/unverifiedSongs/types.ts

Changes:

- Extend SongPreview shape with optional fields:
  - sourceType with values library or shared
  - sharedSongId
  - isUnverifiedSong
- Add dedicated types for shared search result and shared full-song payload.

Edge cases handled:

- Ensure optional fields do not break existing library song rendering.

### Task 2: Add client API modules for Cloudflare shared songs

Files likely edited:

- Create: src/modules/Songs/unverifiedSongs/api.ts
- Create: src/modules/Songs/unverifiedSongs/normalize.ts

Changes:

- Add getUnverifiedSongsSearch(query, limit)
- Add getUnverifiedSongById(sharedSongId)
- Normalize API payload into SongPreview-compatible objects.

Edge cases handled:

- Graceful fallback to empty list on network failure for search.
- Explicit error surface for single-song fetch used by play and edit paths.

### Task 3: Add Cloudflare Functions endpoints

Files likely edited:

- Create: functions/unverified-songs.ts
- Create: functions/unverified-song.ts
- Create: functions/unverified-songs-admin.ts
- Modify: functions/tsconfig.json

Changes:

- shared-songs endpoint for search list
- shared-song endpoint for single full txt fetch by externalSong id
- shared-songs-admin endpoint for CI upsert and remove operations with token auth

Important note:

- shared-song single fetch endpoint is intentionally shared by two frontend consumers:
  - gameplay loading for selected shared song
  - edit page externalSong deep-link loading

Edge cases handled:

- Invalid ids return 404
- Missing auth returns 401 on admin endpoint
- Invalid payload returns 400 with error details

### Task 4: Build CI ingestion and verification script

Files likely edited:

- Create: scripts/cicd/githubActionSyncUnverifiedSongs.ts
- Modify: scripts/utils.cjs

Changes:

- Fetch PostHog share-song and unshare-song deltas using HogQL.
- Parse txt with existing parser.
- Validate checks:
  - UltraStar parse validity
  - video id reachability
  - notes timing within video duration
- Upsert or remove records through admin endpoint.
- Persist cursor after successful run.

Edge cases handled:

- Retry transient PostHog and Cloudflare failures with bounded retries
- Skip poison records but continue batch, storing error details
- Do not move cursor forward if run fails before completion

### Task 5: Add new workflow for 6h sync and delta control

Files likely edited:

- Create: .github/workflows/promote-shared-songs-to-unverified.yml

Changes:

- Schedule every 6 hours
- Manual dispatch with optional backfill window
- Provide required secrets:
  - POSTHOG key
  - Cloudflare admin token
  - optional cursor key namespace

Edge cases handled:

- Concurrency guard to avoid overlapping runs
- Safe rerun behavior with idempotent upsert by songId

### Task 6: Integrate fallback shared group into Song Selection V2

Files likely edited:

- Modify: src/routes/SingASong/SongSelectionV2/Hooks/useSongList.ts
- Modify: src/routes/SingASong/SongSelectionV2/Hooks/useSongListFilter.ts
- Modify: src/routes/SingASong/SongSelectionV2/Components/SongGroupHeader.tsx
- Modify: src/routes/SingASong/SongSelectionV2/Components/SongCard.tsx

Changes:

- Trigger debounced shared search only when:
  - search query is non-empty
  - regular filtered result count is below 8
- Merge shared songs as a separate group below regular results.
- Exclude shared songs whose ids already exist in regular index.
- Add unverified shared visual tag.

Edge cases handled:

- Prevent stale-response overwrite by request token or last-query guard
- If Cloudflare request fails, regular search remains fully usable
- If shared results empty, no extra group is shown

### Task 7: Add pre-play warning and pass source metadata into play setup

Files likely edited:

- Modify: src/routes/SingASong/SongSelectionV2/Components/SongSettings/SongSettings.tsx
- Modify: src/routes/SingASong/SongSelectionV2/Components/SongPreview.tsx
- Modify: src/routes/Game/Game.tsx

Changes:

- Before onPlay, if song is shared unverified, show warning modal.
- On accept, continue to play.
- Ensure selected song setup carries sourceType and sharedSongId.

Edge cases handled:

- Cancel warning keeps user in selection without resetting current focus.

### Task 8: Make gameplay song loading support shared songs

Files likely edited:

- Modify: src/routes/Game/Singing/Singing.tsx
- Modify: src/modules/Songs/hooks/useSong.ts
- Possibly modify: src/modules/Songs/SongsService.ts

Changes:

- Extend useSong input so it can load either:
  - library song by songId using current SongDao flow
  - shared song by sharedSongId through shared-song endpoint
- Keep parser and processSong pipeline the same after txt is loaded.

Reason this task is required:

- Single external song fetch is needed not only for editor deep links but also for actual singing flow when selected song comes from Cloudflare group.

Edge cases handled:

- If shared fetch fails before play starts, show non-blocking error and return to selection.
- If shared payload is malformed despite prior verification, fail gracefully and log telemetry.

### Task 9: Split and force feedback behavior for unverified songs

Files likely edited:

- Modify: src/routes/Game/Singing/GameOverlay/Components/RateSong.tsx
- Modify: src/routes/Game/Singing/GameOverlay/Components/PauseMenu.tsx
- Modify: src/modules/GameEngine/GameState/GameState.ts or relevant metadata holder

Changes:

- Keep current rate-song behavior unchanged for regular songs.
- Add shared mode emitting rate-unverified-song on submit always.
- Payload rules:
  - no issues selected: feedbackType ok and issues []
  - issues selected: feedbackType bad and issues list
- Force showing RateSong for unverified songs regardless of completion percentage.
- Exception: do not force if same song id exists in user regular index.

Edge cases handled:

- If user exits early, still show feedback for shared song mode.
- Ensure regular local songs continue current threshold behavior.

### Task 10: Add edit route support for externalSong

Files likely edited:

- Modify: src/routes/Edit/Edit.tsx
- Possibly create: src/routes/Edit/hooks/useExternalSong.ts

Changes:

- Read externalSong query parameter.
- Fetch full song via shared-song endpoint.
- Convert and feed into existing LazyConvert flow.
- Preserve save flow unchanged so share-song still goes to PostHog.

Edge cases handled:

- Invalid or removed externalSong id shows user-friendly error.
- If both song and externalSong query params exist, define deterministic precedence (recommend externalSong wins when provided explicitly).

### Task 11: Cleanup shared pool on promotion to library

Files likely edited:

- Modify: .github/workflows/import-songs.yml
- Modify: scripts/cicd/githubActionImportSongs.ts

Changes:

- After song promotion, call admin endpoint to mark shared copy removed.
- Use promoted song ids as cleanup batch.

Edge cases handled:

- Cleanup failures should not block import completion, but should be reported.

### Task 12: Tests and verification

Files likely edited:

- Modify or create tests around:
  - useSongList fallback merge behavior
  - RateSong event payload behavior
  - PauseMenu forcing logic
  - useSong shared-source loading
  - Edit externalSong loading

Commands:

- pnpm test
- pnpm lint
- pnpm type-check

Manual checks:

- Search returns normal songs first and shared group only below when regular results less than 8
- Shared song can be warned, played, and rated
- Rate event uses rate-unverified-song with correct payload
- Deep-link with externalSong loads editor
- Imported song disappears from shared pool

---

## 5. File Impact Matrix

Core frontend:

- src/interfaces.ts
- src/modules/Songs/unverifiedSongs/types.ts (new)
- src/modules/Songs/unverifiedSongs/api.ts (new)
- src/modules/Songs/unverifiedSongs/normalize.ts (new)
- src/routes/SingASong/SongSelectionV2/Hooks/useSongList.ts
- src/routes/SingASong/SongSelectionV2/Hooks/useSongListFilter.ts
- src/routes/SingASong/SongSelectionV2/Components/SongCard.tsx
- src/routes/SingASong/SongSelectionV2/Components/SongGroupHeader.tsx
- src/routes/SingASong/SongSelectionV2/Components/SongPreview.tsx
- src/routes/SingASong/SongSelectionV2/Components/SongSettings/SongSettings.tsx
- src/routes/Game/Singing/Singing.tsx
- src/modules/Songs/hooks/useSong.ts
- src/routes/Game/Singing/GameOverlay/Components/PauseMenu.tsx
- src/routes/Game/Singing/GameOverlay/Components/RateSong.tsx
- src/routes/Edit/Edit.tsx

Backend and CI:

- functions/unverified-songs.ts (new)
- functions/unverified-song.ts (new)
- functions/unverified-songs-admin.ts (new)
- functions/tsconfig.json
- scripts/cicd/githubActionSyncUnverifiedSongs.ts (new)
- scripts/cicd/githubActionImportSongs.ts
- scripts/utils.cjs
- .github/workflows/promote-shared-songs-to-unverified.yml (new)
- .github/workflows/import-songs.yml

---

## 6. Explicit Edge Cases and Decisions

1. Duplicate submit, identical content

- Deduplicate by songId plus songTxtHash and update metadata timestamps only.

2. Duplicate submit, changed content

- Keep single active row per songId and overwrite with latest event by created_at.

3. Invalid song format

- Record invalid status and verificationErrors; never return in runtime search.

4. Broken video id

- Mark invalid and exclude from runtime search.

5. Timing outside video length

- Mark invalid and exclude from runtime search.

6. Cloudflare endpoint temporary failure during search

- Return no shared group and keep regular results functional.

7. Cloudflare single-song fetch failure before singing

- Block start with user-facing message and return to selection.

8. Cloudflare single-song fetch failure in edit flow

- Show edit error state and do not open convert view.

9. Same id exists locally

- Exclude from shared search results and do not force shared-song feedback behavior.

10. Workflow overlap

- Use workflow concurrency and idempotent upsert.

11. Cursor corruption or rollback

- Support manual backfill window and deterministic reprocessing.

12. Cleanup failure after promotion

- Do not fail import job, but log and retry next run.

---

## 7. Rollout Strategy

1. Ship backend endpoints and CI sync first.
2. Verify shared records in Cloudflare with dry-run and limited test data.
3. Enable fallback shared search UI behind feature flag if needed.
4. Enable forced shared feedback and new telemetry event.
5. Enable externalSong editor loading.
6. Enable promotion cleanup.

This rollout order limits user-facing blast radius and makes debugging simpler.
