# Online Leaderboard Design

## Goal

A global, public leaderboard of the best karaoke scores from the last 14 days, shown on the main
menu. Players opt in per-score through a prompt after singing. Sung-note data is stored alongside
each record so score verification can be built later.

## Context

- The app is a static SPA served by a Cloudflare Worker (`allkaraoke-party`, `worker/index.ts`)
  that also hosts a handful of JSON endpoints and a PostHog proxy. Only binding today is one KV
  namespace for unverified songs.
- Remote mics run on a separate PartyKit deploy (`allkaraoke-online`). The leaderboard does not
  touch it.
- Scores are computed locally in `calculate-score.ts`, normalized so the theoretical maximum is
  always `MAX_POINTS = 3_500_000` regardless of song.
- A per-song local high-score list already exists (`use-high-scores.ts`), including five fake
  seeded entries. The global board is separate from it.
- `src/routes/game/event-listeners.ts` contains a proof-of-concept that delta-encodes and
  msgpack-packs frequency records purely to measure their size. It is the seed of the notes blob
  but is not usable as-is (see "Notes payload").

## Scope

In scope:

- Global board: best score per `(device, song, name)` over a rolling 14 days, top 50 retained,
  top 10 displayed.
- Prompt after any local game where the highest-scoring player is at or above 1,000,000.
- Name + country capture, persisted in localStorage for prefill.
- Storage of the sung frequency records with each record, unused in v1.
- Admin deletion of individual rows.

Out of scope (deferred, decided explicitly):

- "Always store" / "never ask again" persistence, the armed-submission panel, and inline editing on
  the scores list. v1 prompts on every qualifying score with a plain yes/no. Accepted consequence: a
  player who never wants to participate sees the modal after every qualifying song.
- Server-side score verification by replaying the notes blob.
- "Remove my score" self-service.
- Difficulty normalization — the board mixes tolerances and is sorted purely by score.
- Player accounts/profiles.
- Turnstile or any real anti-automation.
- Online (multiplayer room) games. They are already excluded structurally: `PostGameView` receives
  `highScoresEnabled={false}` for online, and the prompt lives on the high-scores step.

## Chosen Approach

Write path and read path are fully separated.

```
client ──POST /leaderboard──> Worker ──> Durable Object (SQLite)   [source of truth]
                                              │
                                              └── writes top-50 JSON ──> KV `board:v1`

client ──GET  /leaderboard──> Worker ──> caches.default ──miss──> KV `board:v1`
```

- **Durable Object with SQLite storage** is the source of truth. It gives atomic
  read-modify-write (KV alone has no compare-and-swap and up-to-60s propagation, so concurrent
  submissions would silently overwrite each other), and `alarm()` for expiry without a Cron Trigger.
  SQLite-backed Durable Objects are available on the Workers free plan.
- **Every qualifying submission is stored**, not only the ones that currently make the board. A
  "discard anything outside the top 50" rule cannot survive 14-day expiry: discarded rows are
  unrecoverable, so the board would erode toward empty as leaders age out.
- **The read path never touches the DO.** Free-plan Durable Objects allow 100k requests/day; a cache
  miss per colo per TTL would burn that for a board that changes a few times an hour. The DO projects
  a ~8 KB JSON blob into KV on every accepted write, and the Worker serves that through the Cache
  API.
- **Notes blobs live in a separate SQLite table inside the DO** and are never `SELECT`ed by the board
  query, so they never load into a read. No R2 bucket is needed. Per-object SQLite storage is capped
  at 10 GB; at tens of KB per record with 14-day expiry this is not a constraint.

## Data Model

Inside the Durable Object:

```sql
CREATE TABLE records (
  id               TEXT PRIMARY KEY,
  client_id        TEXT NOT NULL,
  song_id          TEXT NOT NULL,
  artist           TEXT NOT NULL,
  title            TEXT NOT NULL,
  song_last_update TEXT,
  name             TEXT NOT NULL,
  name_normalized  TEXT NOT NULL,
  country          TEXT,              -- ISO-3166 alpha-2, NULL = not stated
  score            INTEGER NOT NULL,
  tolerance        INTEGER NOT NULL,
  mode             TEXT NOT NULL,
  track_index      INTEGER NOT NULL,
  input_lag        INTEGER NOT NULL,
  notes_hash       TEXT NOT NULL,
  created_at       INTEGER NOT NULL   -- epoch ms
);

CREATE UNIQUE INDEX records_dedupe ON records (client_id, song_id, name_normalized);
CREATE INDEX records_score        ON records (score DESC);
CREATE INDEX records_created_at   ON records (created_at);

CREATE TABLE notes (
  record_id TEXT PRIMARY KEY REFERENCES records (id),
  blob      BLOB NOT NULL
);
```

Dedupe key is `(client_id, song_id, name_normalized)`, best score wins. `name_normalized` is trimmed,
casefolded, whitespace-collapsed. Consequence accepted: a single user can occupy several rows for one
song by changing the submitted name. Admin deletion is the remedy.

Artist and title are denormalized into the record so the board renders standalone, without the client
resolving a song index and without a removed song blanking a row. A renamed song keeps its old title
for up to 14 days.

## API

### `POST /leaderboard`

Body is msgpack (`msgpackr`, already a dependency and already used for the notes PoC). JSON with
base64 would inflate a 30–90 KB blob by a third for no benefit.

```ts
{
  clientId: string,        // uuid v4, localStorage
  songId: string,
  artist: string,
  title: string,
  songLastUpdate: string,
  score: number,
  tolerance: number,
  mode: string,
  trackIndex: number,
  inputLag: number,
  name: string,
  country: string | null,
  notesHash: string,       // sha-256 hex over packed notes bytes ++ score
  notes: Uint8Array,       // packed frequency records
}
```

Rejections (all return a status the client ignores — submission is fire-and-forget):

- body over 256 KB
- `score < 1_000_000` or `score > MAX_POINTS`
- `notes` missing, or record count implausible for the song's duration
- `notesHash` does not match a server-side recomputation over `notes ++ score`
- rate limit exceeded

`MAX_POINTS` is imported from `~/consts`, not hardcoded, so the cap cannot drift from the scoring
formula.

### `GET /leaderboard`

Returns the KV projection with `Cache-Control: public, max-age=60, stale-while-revalidate=600`.

```ts
{
  generatedAt: number,
  entries: Array<{
    name: string,
    country: string | null,
    score: number,
    artist: string,
    title: string,
    songId: string,
    tolerance: number,
    createdAt: number,   // epoch ms; the client renders the relative date
  }>
}
```

No `clientId`, no row ids, no IP-derived values — this document is world-readable. Dates are returned
as timestamps and formatted client-side; a relative date baked into a 60s-cached response goes stale
in a way users notice.

### `DELETE /leaderboard-admin`

Deletes one row by id, reusing the existing `ADMIN_PANEL_PASSWORD` auth from the unverified-songs
admin. Deleting rebuilds the KV projection. Row ids reach the admin UI through an authenticated list
endpoint, never through the public board.

### Expiry

`alarm()` runs daily: delete `records` older than 14 days, delete their `notes`, rebuild the
projection.

## Notes Payload

The PoC in `event-listeners.ts` is not fit for purpose and must be reworked before v1 ships,
otherwise the stored data is worthless and the collection window is lost:

1. It reads `GameState.getPlayer(0)`. In multiplayer, only the highest scorer submits, and that is
   frequently not player 0 — the stored notes would belong to a different human than the score.
2. It filters to `getPlayerNoteDistance(note) === 0`, keeping only hits. Score arithmetic does only
   need hits (`calculate-score.ts` skips non-zero distances, and the denominator comes from the
   chart, which the server has) — but a hits-only stream is indistinguishable from a synthesized
   perfect one. Misses and pitch jitter are the cheapest cheat signal available and the filter
   discards them.
3. Re-running pitch-to-note matching server-side additionally needs `tolerance`, `inputLag` and
   `trackIndex`, none of which the PoC captures.

v1 therefore stores **all** frequency records of the submitting player, delta-encoded and packed as
in the PoC, plus those three fields on the record.

## Client Flow

1. Song ends. The highest-scoring local player's score is compared against the threshold
   (1,000,000, scaled by the same `isE2E()` factor `use-high-scores.ts` applies, so e2e exercises the
   real branch).
2. On the high-scores step, a modal asks for name and country with yes/no. Name prefills from
   localStorage if present, otherwise from the player slot; country prefills from localStorage.
3. "Yes" submits immediately over plain `fetch` and persists name + country to localStorage. "No"
   dismisses; nothing is stored and the prompt returns after the next qualifying song.
4. Failures are swallowed — no retry queue, no error surfaced. A vanity board does not earn one.

Because the submit fires on an explicit click, no `sendBeacon`/`keepalive` path is needed and the
64 KB `keepalive` body cap does not apply.

## UI

**Main menu.** `MenuWithLogo` becomes a two-column layout: the existing centered menu, and the board
to its right. On mobile the board sits below the menu and above the "Get in touch" footer. The board
shows 10 rows, scrollable by mouse/touch, and is skipped by `useKeyboardNav` — making 50 rows
keyboard-traversable would add a navigation sink that TV users hit by accident. TV users see 10 rows;
that is the whole feature there.

Each row: position, player name, score, artist and title, difficulty, relative date
(`dayjs().fromNow()`), and the country flag. The existing `Flag` component already falls back to the
`un` flag on error, which is the required "world" icon for players with no country.

States: skeleton while loading (AKUI `skeleton.tsx`), "No results yet" when empty, "Failed to load
results" on error. SWR handles the fetch.

**Country picker.** A new AKUI `Select` — searchable, locked value, `{ value, label, icon }` options,
with an explicit "Prefer not to say" first option rendering the `un` flag. The existing
`Autocomplete` cannot be reused: it is free-text over `options: string[]` with no value/label split.
It reuses `Autocomplete`'s filtering, arrow-key handling and `scrollIntoView` internals.

**Privacy.** Names and countries carry `ph-no-capture`, matching the existing local high-score list.

## Abuse Posture

Stated plainly so nothing here reads as security:

- Any client can POST an arbitrary score up to 3.5M. The notes hash is *integrity, not
  authenticity* — it stops someone editing the score field of a captured request, but anyone reading
  the bundle can compute a valid hash for a fully fabricated record.
- `clientId` is a localStorage string the client generates, so rotating it defeats the per-client
  rate limit in one line of console.
- Consequently a motivated person can fill all 50 rows, and manual admin deletion is the only
  recourse. This is accepted for v1; the deferred notes replay is the real answer.

Rate limiting is whatever the Workers rate limiting binding gives for free. The binding only accepts
`period` values of 10 or 60 seconds, so "30 per hour" is not expressible; the closest equivalent is
**2 requests per 60 seconds per `clientId`**, which is well above any real party's submission rate and
needs no state of our own. No hourly bookkeeping table — given that `clientId` rotation defeats the
limit anyway, exactness here would buy nothing.

## Rollout

Two deploys. First the Worker with the DO binding, migration and endpoints, verified live with curl.
Then the client behind a new PostHog feature flag (`leaderboard`), flag off, enabled for the author
first. The flag is the kill switch if the board fills with abuse — no deploy needed.

## Implementation notes

Corrections to the assumptions above, found while building it:

- **`~/consts` does not resolve in the Worker.** The `~` alias comes from `tsconfig.json`, whose
  `include` covers `src`/`tests`/`scripts`/`partykit` and explicitly excludes `functions`; `worker/`
  is in neither. Worker files therefore import from `src/` with relative paths. `MAX_POINTS` is
  still imported rather than hardcoded, as intended.
- **`msgpackr` unpacks under the Workers runtime as-is.** No `nodejs_compat` flag and no manual
  decoding were needed. `pack()` is typed as returning node's `Buffer`, so the client casts it for
  `fetch`.
- **The DO test lives with the DO.** `worker/unverified-songs-store.test.ts` is actually
  `functions/unverified-songs-store.test.ts`; the `functions` vitest project now also includes
  `worker/**/*.test.ts` so `worker/leaderboard-do.test.ts` runs under the Workers pool.
- **SQLite enforces the `notes → records` foreign key.** Expiry and deletion must remove the blob
  before the record, which the plan's ordering did not account for.
- **`GET /leaderboard` needed a cache purge.** With a 60s `max-age`, the empty board cached on the
  first main-menu visit outlives a submission made seconds later, so the submitter cannot see their
  own row. An accepted `POST` now deletes the cached entry in its own colo.
- **The feature flag cannot be read through `useFeatureFlag` under e2e.** That hook forces every
  flag on in dev and e2e, which would have put the board into every existing spec and every
  main-menu screenshot. `use-leaderboard-enabled.ts` consults an e2e-only opt-in instead.
- **Country names are pinned to English.** `Intl.DisplayNames` follows the browser locale, which put
  Polish country names in an otherwise English-only UI (and made the e2e machine-dependent).
- **The e2e sings on Easy.** The stubbed microphone scores about 890k on the default difficulty —
  under the 1,000,000 the Worker requires — so the submission would be rejected server-side. On Easy
  it clears 1.3M. The client-side threshold is scaled by `isE2E()` as designed; the server's is not,
  and cannot be.

## Testing

- DO board logic (insert, dedupe, top-50 projection, expiry, rate limit) with
  `@cloudflare/vitest-pool-workers`, following `worker/unverified-songs-store.test.ts`.
- The prompt modal and the new `Select` with `playwright-ct`.
- One e2e: sing → qualify → prompt → submit → board renders, against local `wrangler dev`. The
  feature flag also gives the e2e an off-state to assert against.
