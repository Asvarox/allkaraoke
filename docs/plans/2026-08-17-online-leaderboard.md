# Online Leaderboard Implementation Plan

Companion to `2026-08-17-online-leaderboard-design.md`. Read that first — it holds the rationale and
the explicitly deferred scope.

## Important Context

- Worker entry is `worker/index.ts`, a hand-rolled pathname router delegating to Pages-style handlers
  in `functions/`. New routes are added there.
- `wrangler.jsonc` currently has one KV namespace and no Durable Objects. Both a DO binding and a
  `migrations` block with `new_sqlite_classes` are new.
- `msgpackr` is already a dependency and already used for the notes PoC. Verify it unpacks under the
  Workers runtime before relying on it server-side; if it needs `nodejs_compat`, add the flag or
  decode the payload manually.
- Score threshold and cap must both derive from `MAX_POINTS`; do not hardcode 3,500,000 in the
  Worker.
- Do not touch the PartyKit project. Online games are excluded from the leaderboard.

## Task 1: Move `MAX_POINTS` to shared consts

- Move `MAX_POINTS = 3_500_000` from
  `src/modules/game-engine/game-state/helpers/calculate-score.ts` into `src/consts.ts`.
- Re-export it from `calculate-score.ts` so existing importers are unaffected.
- Rationale: the Worker needs the constant, and importing `calculate-score.ts` would drag in
  `es-toolkit`, `~/interfaces` and the song utils.

## Task 2: Rework the notes payload capture

Current PoC lives inline in `src/routes/game/event-listeners.ts` and is wrong in three ways (see
design doc, "Notes Payload").

- Extract it into `src/modules/leaderboard/notes-payload.ts` as a pure function taking the player's
  notes and returning packed bytes.
- Capture the **submitting** player's notes (highest local score), not `GameState.getPlayer(0)`.
- Drop the `getPlayerNoteDistance(note) === 0` filter — keep all frequency records.
- Return `tolerance`, `inputLag` and `trackIndex` alongside, for inclusion in the record.
- Remove the `console.log` and the measurement comment from `event-listeners.ts`.
- Unit-test the encoder round-trip and that the packed size stays within the 256 KB request cap for
  a long song.

## Task 3: Durable Object store

New `worker/leaderboard-do.ts` exporting a `LeaderboardBoard` class with SQLite storage.

- Schema and indexes exactly as in the design doc, created on first use.
- `submit(record, notesBlob)`: validate, upsert on `(client_id, song_id, name_normalized)` keeping
  the higher score, insert the blob into `notes`, rebuild the projection. No rate-limit state here —
  that lives entirely in the binding at the Worker edge.
- `projection()`: top 50 by score over the last 14 days, mapped to the public shape — no
  `client_id`, no row ids. Never selects from `notes`.
- `listForAdmin()` / `deleteRow(id)`: include ids; deleting rebuilds the projection.
- `alarm()`: daily expiry of records older than 14 days, orphan `notes` cleanup, projection rebuild;
  reschedule itself.
- Unit tests with `@cloudflare/vitest-pool-workers`, mirroring `worker/unverified-songs-store.test.ts`:
  insert, dedupe keeps the higher score, distinct names produce distinct rows, expiry drops old rows
  and backfills the board from previously-unranked records.

## Task 4: Worker routes and bindings

- `wrangler.jsonc`: add the DO binding + `migrations` with `new_sqlite_classes: ["LeaderboardBoard"]`,
  a `LEADERBOARD_KV` namespace, and the rate limiting binding at `2` per `60` seconds keyed on
  `clientId` (the binding only accepts periods of 10 or 60 seconds; this is the closest usable
  setting to the intended 30/h and needs no extra bookkeeping).
- `worker/leaderboard.ts`: `POST /leaderboard` (msgpack decode, size cap, score bounds against
  `MAX_POINTS`, notes presence and plausibility, sha-256 hash recomputation over `notes ++ score`,
  rate limit, forward to the DO) and `GET /leaderboard` (`caches.default` → KV,
  `max-age=60, stale-while-revalidate=600`).
- `worker/leaderboard-admin.ts`: authenticated list + delete, reusing the `ADMIN_PANEL_PASSWORD`
  pattern from `functions/unverified-songs-browser-admin-auth.ts`.
- Register all three in `worker/index.ts`.
- Worker-level tests for the validation branches.

## Task 5: AKUI searchable `Select`

- New `src/modules/elements/akui/select.tsx`: controlled, `options: { value, label, icon? }[]`,
  search input filtering the list, Enter commits, Escape reverts, keyboard-nav friendly.
- Reuse `Autocomplete`'s filter, arrow-key handling and `scrollIntoView` internals; leave
  `Autocomplete` itself unchanged.
- `select.stories.tsx` following the existing `selector.stories.tsx` pattern.
- `playwright-ct` coverage for search, keyboard selection, and Escape.

## Task 6: Leaderboard client module

New `src/modules/leaderboard/`:

- `types.ts` — shared record and board entry shapes.
- `identity.ts` — localStorage-backed `{ name, country }` plus the uuid `clientId` (`uuid` is already
  a dependency). Name precedence: stored value wins; the player slot name only seeds it the first
  time.
- `client.ts` — `submitScore()` (msgpack pack, plain `fetch`, errors swallowed) and the SWR fetcher
  for `GET /leaderboard`.
- `qualifies.ts` — threshold check against `MAX_POINTS`-derived 1,000,000, scaled by `isE2E()` the
  same way `use-high-scores.ts` scales scores.
- Add `Leaderboard: 'leaderboard'` to `src/modules/utils/feature-flags.ts`.

## Task 7: Post-game prompt

- `src/routes/game/singing/post-game/views/leaderboard-prompt.tsx`: modal on the high-scores step,
  shown when the highest local score qualifies and the feature flag is on. Name input + the new
  country `Select` (with "Prefer not to say" first, rendering the `un` flag) + yes/no.
- "Yes" persists name and country to localStorage and submits immediately. "No" dismisses and stores
  nothing; the prompt returns after the next qualifying song.
- Follow the AKUI `confirm-modal.tsx` conventions and register with `useKeyboardNav` so the remote
  mic can drive it. Note that `HighScoresView` registers its `Select song` button last on purpose —
  keep the modal's registration from disturbing that ordering.
- Apply `ph-no-capture` to the name and country fields.
- Online games are already excluded: the high-scores step is not rendered when
  `highScoresEnabled` is false.

## Task 8: Main-menu board panel

- `src/routes/welcome/leaderboard-panel.tsx`: SWR fetch, 10 rows visible with mouse/touch scroll,
  skipped by `useKeyboardNav`, `ph-no-capture` on names and countries.
- Row: position, name, score, artist — title, difficulty, `dayjs().fromNow()` relative date, and the
  country flag via the existing `Flag` component (its `un` fallback is the world icon).
- Register the `relativeTime` dayjs plugin if it is not already registered app-wide.
- States: AKUI `skeleton.tsx` while loading, "No results yet" when empty, "Failed to load results"
  on error.
- Layout: `menu-with-logo.tsx` becomes two-column on desktop with the panel to the right of the menu;
  on mobile the panel renders below the menu and above the "Get in touch" footer in
  `src/routes/welcome/welcome.tsx`.
- Render nothing at all when the feature flag is off.

## Task 9: Admin deletion UI

- `src/routes/admin/leaderboard-management.tsx` plus an API client alongside
  `unverified-songs-admin-api.ts`, listing current rows with a delete button each.
- Link it from `src/routes/admin/admin.tsx` following the existing admin page pattern.

## Task 10: E2E

- One Playwright spec: sing a qualifying score → prompt appears → fill name and country → submit →
  the main-menu board shows the row. Runs against local `wrangler dev`.
- A second, cheap assertion that the panel and prompt are absent when the feature flag is off.
- Add a page object under `tests/page-objects/` consistent with the existing ones.

## Task 11: Documentation

- Add a `docs/leaderboard.md` describing the write/read split, the DO schema and the expiry alarm.
- Add glossary entries to `context.md`: **global leaderboard**, **leaderboard identity**,
  **qualifying score**, **notes blob**.
- Note in the design doc if any assumption above turned out wrong during implementation.

## Task 12: Deploy and verify

1. Deploy the Worker with the DO binding and migration. Verify `POST`/`GET /leaderboard` with curl,
   including a rejected over-cap score and a rejected bad hash.
2. Deploy the client with the `leaderboard` flag off.
3. Enable the flag for the author only; sing a qualifying score end to end on production.
4. Enable for everyone. Watch `leaderboardSubmitted` / opt-in / opt-out events in PostHog (score and
   songId only — never name or country) to judge whether the prompt converts.
