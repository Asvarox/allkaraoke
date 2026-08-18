# Global Leaderboard

A public board of the best karaoke scores from the last 14 days, shown on the main menu. Players opt
in per score through a prompt after singing. The sung frequency records are stored alongside each
record so score verification can be built later; nothing reads them in v1.

Design rationale and the explicitly deferred scope live in
`docs/plans/2026-08-17-online-leaderboard-design.md`.

## Write / read split

```
client ──POST /leaderboard──> Worker ──> LeaderboardBoard (Durable Object, SQLite)  [source of truth]
                                              │
                                              └── writes the top-50 JSON ──> KV `board:v1`

client ──GET  /leaderboard──> Worker ──> caches.default ──miss──> KV `board:v1`
```

The read path never touches the Durable Object. Free-plan DOs allow 100k requests/day, and a cache
miss per colo per TTL would burn that on a board that changes a few times an hour. The DO projects a
~8 KB JSON blob into KV on every accepted write, and the Worker serves that through the Cache API
with `max-age=60, stale-while-revalidate=600`.

After an accepted submission the Worker deletes its own colo's cached copy, so the submitting player
sees their row immediately instead of waiting out the 60s. Other colos keep serving their cached
copy until it expires.

## Files

| Path | Role |
| --- | --- |
| `worker/leaderboard-do.ts` | `LeaderboardBoard` — SQLite storage, projection, expiry alarm |
| `worker/leaderboard.ts` | `POST` validation + `GET` cache/KV read path |
| `worker/leaderboard-admin.ts` | Authenticated list + delete |
| `src/modules/leaderboard/types.ts` | Shapes shared by client and Worker — must stay dependency-free |
| `src/modules/leaderboard/consts.ts` | `QUALIFYING_SCORE` and the payload bounds, derived from `MAX_POINTS` |
| `src/modules/leaderboard/notes-payload.ts` | Delta encoder/decoder for the frequency records |
| `src/modules/leaderboard/notes-hash.ts` | sha-256 over `notes ++ score`, used on both sides |
| `src/modules/leaderboard/identity.ts` | localStorage `clientId`, name and country |
| `src/routes/game/singing/post-game/views/leaderboard-prompt.tsx` | The opt-in modal |
| `src/routes/welcome/leaderboard-panel.tsx` | The board on the main menu |
| `src/routes/admin/leaderboard-management.tsx` | Row deletion |

The Worker imports from `src/` with **relative** paths. The `~` alias is only configured for the app
build, so `~/modules/...` does not resolve inside the Worker bundle or its tests.

## Durable Object schema

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

Dedupe key is `(client_id, song_id, name_normalized)` and the higher score wins. `name_normalized`
is trimmed, casefolded and whitespace-collapsed; the displayed `name` keeps the player's own
spacing. One person can still occupy several rows for one song by changing the submitted name —
admin deletion is the remedy.

Artist and title are denormalized so the board renders standalone: no song-index lookup on the
client, and a removed song does not blank a row.

**Every** accepted submission is stored, not only the ones that currently rank. A "discard anything
outside the top 50" rule cannot survive the 14-day expiry — discarded rows are unrecoverable, so the
board would erode toward empty as leaders age out.

The notes blobs live in their own table and are never `SELECT`ed by the board query, so they never
load into a read. SQLite enforces the foreign key, so anything that deletes records deletes the
matching blobs first.

## Expiry alarm

`alarm()` runs once a day and reschedules itself:

1. delete the `notes` blobs of records older than 14 days,
2. delete those records,
3. sweep any orphaned blobs,
4. rebuild the KV projection.

The alarm is scheduled the first time the object is constructed, so no Cron Trigger is involved.

## Validation

`POST /leaderboard` rejects, in order:

- a body over 256 KB,
- a body that is not msgpack, or is missing a required field,
- a non-integer score, or one below `QUALIFYING_SCORE` or above `MAX_POINTS`,
- missing notes, malformed notes, or a record count outside the plausibility bounds,
- a `notesHash` that does not match a server-side recomputation over `notes ++ score`,
- a client over the rate limit.

The hash is **integrity, not authenticity**: it stops someone editing the score field of a captured
request, but anyone reading the bundle can compute a valid hash for a fabricated record. `clientId`
is a localStorage string the client generates, so rotating it defeats the rate limit. A motivated
person can fill all 50 rows and manual admin deletion is the only recourse. This is accepted for v1;
replaying the notes blob is the real answer and is deferred.

## Bindings

`wrangler.jsonc` needs, beyond the existing KV namespace:

- `LEADERBOARD_KV` — the projection. **The committed ids are placeholders**; create the namespace
  with `wrangler kv namespace create LEADERBOARD_KV` and replace them before deploying.
- `LEADERBOARD_BOARD` — the Durable Object, plus a `migrations` entry with
  `new_sqlite_classes: ["LeaderboardBoard"]`.
- `LEADERBOARD_RATE_LIMITER` — 2 requests per 60s per `clientId`. The binding only accepts periods
  of 10 or 60 seconds, so the intended 30/h is not expressible; this is the closest usable setting
  and needs no bookkeeping of our own.

## Feature flag and tests

The client is gated behind the PostHog `leaderboard` flag. `useFeatureFlag` forces every flag on
under e2e, which would put the board into every existing spec and every main-menu screenshot, so
`use-leaderboard-enabled.ts` consults an e2e-only opt-in instead (`enableLeaderboard` in
`tests/helpers.ts`). That also gives the spec a real off-state to assert against.

- `worker/leaderboard-do.test.ts`, `worker/leaderboard.test.ts` — Durable Object and route
  behaviour, under `@cloudflare/vitest-pool-workers`. These live in the `functions` vitest project;
  `vite.config.mts` includes `worker/**/*.test.ts` there.
- `src/modules/leaderboard/notes-payload.test.ts` — encoder round-trip and payload size.
- `src/modules/elements/akui/select.spec.tsx` — the country picker, under `playwright-ct`.
- `tests/leaderboard.spec.ts` — sing → prompt → submit → the row appears on the main menu, plus the
  flag-off state.
