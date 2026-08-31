# Global Leaderboard

A public board of the best karaoke scores from the last 14 days, shown on the main menu, plus an
all-time per-song board on the post-game screen. Players opt in per score through a prompt after singing. The
sung frequency records are stored alongside each record so score verification can be built later;
nothing reads them in v1.

Design rationale and the explicitly deferred scope live in
`docs/plans/2026-08-17-online-leaderboard-design.md`.

## Write / read split

```text
client ──POST /leaderboard──> Worker ──> LeaderboardBoard (Durable Object, SQLite)  [source of truth]
                                              │
                                              └── writes the top-50 JSON ──> KV `board:v1`

client ──GET  /leaderboard──> Worker ──> caches.default ──miss──> KV `board:v1`

client ──GET  /leaderboard-song?songId&tolerance&score──> Worker ──> LeaderboardBoard
```

The read path never touches the Durable Object. Free-plan DOs allow 100k requests/day, and a cache
miss per colo per TTL would burn that on a board that changes a few times an hour. The DO projects a
~8 KB JSON blob into KV on every accepted write, and the Worker serves that through the Cache API
with `max-age=60, stale-while-revalidate=600`.

After an accepted submission the Worker deletes its own colo's cached copy, so the submitting player
sees their row immediately instead of waiting out the 60s. Other colos keep serving their cached
copy until it expires.

## Files

| Path                                                   | Role                                                                          |
| ------------------------------------------------------ | ----------------------------------------------------------------------------- |
| `worker/leaderboard-do.ts`                             | `LeaderboardBoard` — SQLite storage, projection, expiry alarm                 |
| `worker/leaderboard.ts`                                | `POST` validation, the global `GET` cache/KV read path, and the per-song read |
| `worker/leaderboard-admin.ts`                          | Authenticated list, delete, and manual projection rebuild                     |
| `src/modules/leaderboard/types.ts`                     | Shapes shared by client and Worker — must stay dependency-free                |
| `src/modules/leaderboard/consts.ts`                    | `QUALIFYING_SCORE`, `MAX_QUALIFYING_TOLERANCE` and the payload bounds         |
| `src/modules/leaderboard/notes-payload.ts`             | Delta encoder/decoder for the frequency records                               |
| `src/modules/leaderboard/notes-hash.ts`                | sha-256 over `notes ++ score`, used on both sides                             |
| `src/modules/leaderboard/identity.ts`                  | localStorage `clientId`, name and country                                     |
| `src/modules/leaderboard/sharing.ts`                   | The standing decision: undecided / always / never                             |
| `src/routes/game/singing/post-game/views/leaderboard/` | The prompt, the high-scores panel, and the hook holding their shared state    |
| `src/modules/leaderboard/leaderboard-row.tsx`          | One row, shared by the main-menu board and the per-song board                 |
| `src/routes/welcome/leaderboard-panel.tsx`             | The board on the main menu                                                    |
| `src/routes/admin/leaderboard-management.tsx`          | Row deletion and the rebuild button                                           |

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

The public projection selects only rows within the 14-day window whose `tolerance` is Medium or
harder (`MAX_GLOBAL_BOARD_TOLERANCE`). It is rebuilt on every write and by the daily alarm, never on deploy — so a change to what
it selects reaches the board on the next submission, or up to a day later. `POST /leaderboard-admin`
(the admin panel's **Rebuild public board**) applies it immediately and purges the read cache. Submissions easier than that are already rejected, so the filter is there for rows stored
before the rule and for the admin listing, which deliberately keeps showing everything.

**Every** accepted submission is stored, not only the ones that currently rank, and rows are never
deleted. A "discard anything outside the top 50" rule cannot survive the global board's 14-day
window — discarded rows are unrecoverable, so the board would erode toward empty as leaders age out —
and the per-song boards are all-time, so a row that has aged off the main menu is still ranked on its
own song's.

The notes blobs live in their own table and are never `SELECT`ed by the board query, so they never
load into a read. SQLite enforces the foreign key, so anything that deletes records deletes the
matching blobs first.

## The per-song board

`GET /leaderboard-song?songId=…&tolerance=…&score=…` answers, for the song that was just sung, "who
else has sung this, and where would this score land among them". It is rendered beside the local
high scores on the post-game step, behind the `song_leaderboard` flag (see below), and returns:

```ts
{ entries: BoardEntry[]; total: number; position: number | null }
```

It is read **straight off the Durable Object** rather than from KV and the Cache API. There is one of
these boards per (song, difficulty) rather than one in total, so a KV projection would mean thousands
of values rewritten on every submission; and `score` differs on nearly every call, so an edge cache
would miss more or less always. The read happens once per finished song, orders of magnitude below
main-menu loads, which is the side of the trade that makes the DO read the cheap one. The response is
`private, max-age=30` — it is keyed on one player's score and is not reusable by anyone else.

Split by **difficulty only**, matched exactly rather than `<=`: a wider pitch window is a different
game, so Medium rows would flatter a Hard singer and vice versa. The **vocal track is deliberately
not part of the split** — both singers of a duet are ranked together, and the extra axis is not worth
the rows it would fragment. `tolerance` above `MAX_SUBMITTED_TOLERANCE` is rejected outright: the
debug widths are never stored, so such a request could only describe an empty board.

**All-time**, with no date window. A song's board is not something anyone races weekly, and cutting
it to a fortnight would empty it for every song nobody happened to sing lately. This is why the
expiry alarm no longer deletes rows (see below).

`position` counts rows scoring `>=` the queried score, plus one. `>=`, not `>`, because a submitted
tie gets a later `created_at` and so sorts behind the row that got there first — the order the board
itself would give it. The cost is that a score _already_ on the board is ranked one place below where
it sits; the query answers where a score _would_ land, and the post-game panel asks before the
submission goes out.

`entries` is a **window around that position**, not the top of the board: `SONG_BOARD_NEIGHBOURS`
rows either side of where the score lands, with `startPosition` giving the rank of the first of them.
Being told you are 4,000th under a list of people you will never catch says nothing; your neighbours
do. With no score to place there is nothing to centre on, so the response is the top
`SONG_BOARD_SIZE` instead.

The panel then slots the run just sung into that window as a row of its own, ringed with the same
`subtle-focus` inset the focused controls elsewhere carry, and scrolls it to the middle of the list.
The row is synthetic — the score has usually not been submitted yet, and nothing refetches after it
has. The ranks still come out right: the rows above the insertion keep theirs, and the ones below are
pushed down by exactly the one row that joined them.

The panel shows regardless of whether the score qualifies for submission — telling a player who is
nowhere near the board where they would have landed is the only reason to show it to them. It is
hidden entirely for a difficulty that is never stored. It is headed "Global scoreboard", and the local high scores beside it are rebuilt on the same panel and
row as "Local scoreboard" — the two sit side by side, so anything that made them look like different
components would read as a mistake. The local board keeps everything it did before, the inline rename
field included; only its presentation moved.

The pairing does put "Global scoreboard" next to a share panel that tells an Easy player their score
is "not the global one". The heading is about where the scores come from — this device or everyone —
and the subtitle under it scopes the board ("This song · Easy · all time · 121 scores"), but it is a
wording collision worth knowing about.

The two panels split the width evenly (`basis-0`) and share a height (`h-full` under an
`items-stretch` row), so they read as one thing split in two rather than two widgets that happen to
be adjacent. They span the full content width, lining up with the share panel and the tip below them.

`ScoreboardPanel` and `ScoreboardRow` are used by **all three** boards — the local high scores, the
song's global board, and the global board on the main menu — so a board looks like a board wherever
it turns up. Sizing and padding are the caller's, passed as `className`: Tailwind classes of the same
property do not merge through `clsx`, so nothing a caller might override can live in the base.

The local board fills any height it has left over with placeholder rows (`ScoreboardPanel`'s `fill`).
Only five scores are ever kept per song, so without them the list trails off into empty panel beside
a global board that fills its own. How many fit is measured rather than assumed — the height is
whatever the step left over and the row height comes from the rows — and placeholders are excluded
from that measurement so they cannot feed back into it.

**The keyboard-help overlay overlaps the global board.** It is fixed to the top-right of every screen
and shown by default (`KeyboardHelpVisibilitySetting`), and the high-scores step is the only one
whose content reaches that corner. The boards used to reserve a band clear of it, but that stopped
them short of the share panel below; they are full width now, so the overlay prints over the global
board's heading and first row or two. Shift+H hides it. Moving the overlay on this step, or putting
the band back, are the two ways out if it proves annoying.

The boards take whatever height the step has left instead of a fixed cap, and scroll inside it. That
needs `min-h-0` on the step's column in `post-game-view.tsx` — a flex item defaults to
`min-height: auto` and will not shrink, so without it the boards pushed the button that moves on off
the bottom of the screen.

Nothing rate-limits this route: it is a `GET` with no `clientId` to key on, and it is a read of rows
that `GET /leaderboard` already exposes.

## Two boards, two difficulty rules

There are two limits on a run's `tolerance`, and they exist for different reasons:

| Constant                     | Value      | Meaning                                                                                                                                                      |
| ---------------------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `MAX_SUBMITTED_TOLERANCE`    | 3 (Easy)   | The easiest run stored at all, **with the per-song boards on**. Above it are the dev-only debug widths, which are not a shipped difficulty and get no board. |
| `MAX_GLOBAL_BOARD_TOLERANCE` | 2 (Medium) | The easiest run the **global** board ranks.                                                                                                                  |

The global board mixes every song and every difficulty into one ranking, and each tolerance step
widens the pitch window the scoring uses — an Easy run reaches the qualifying score for singing that
would not come close on Medium, so those rows are not comparable. The per-song boards are split by
difficulty, so an Easy run is only ever ranked against other Easy runs of the same song and there is
nothing incomparable about it. That is why Easy is stored and shown, and still kept off the main
menu.

`src/modules/leaderboard/qualifies.ts` is where the client says which is which:
`hasLeaderboard(tolerance, songBoardsEnabled)` (is there a board to reach) and
`reachesGlobalBoard(tolerance)` (does the main menu rank it). With the per-song boards flagged off,
`hasLeaderboard` falls back to the global limit — an Easy score collected then would sit in storage
with nothing to show it on. Medium and harder are collected either way. The post-game copy is driven by the second one throughout — the prompt's header
and question, the share panel's "goes on … as:" line, and the opt-in offer all name **the song's own
board** rather than the global one for an Easy run. Telling a player their score is "on the
leaderboard" and then having them not find it on the main menu is the failure this avoids.

## Expiry alarm

`alarm()` runs once a day and reschedules itself:

1. delete the `notes` blobs of records older than `NOTES_RETENTION_MS`,
2. sweep any orphaned blobs,
3. rebuild the KV projection.

The alarm is scheduled the first time the object is constructed, so no Cron Trigger is involved.

**Only the blobs expire.** The rows are kept indefinitely, which is what makes the per-song boards
all-time; the global board does its own windowing in `projection()` rather than relying on rows
having been deleted. Two constants say so separately: `GLOBAL_BOARD_WINDOW_MS` is how far back the
main menu's board looks, `NOTES_RETENTION_MS` is how long the frequency records are kept. Both are 14
days today, for unrelated reasons.

The blobs are the only large thing here — a row is a couple of hundred bytes against up to 256 KB for
a blob — so keeping rows forever costs little, and nothing reads the blobs yet.

## Validation

`POST /leaderboard` rejects, in order:

- a body over 256 KB,
- a body that is not msgpack, or is missing a required field,
- a non-integer score, or one below `QUALIFYING_SCORE` or above `MAX_POINTS`,
- a `tolerance` easier than `MAX_SUBMITTED_TOLERANCE` (the dev-only debug widths above Easy),
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

## Standing decisions

The prompt is asked once, and both of its answers are standing decisions —
`LeaderboardSharingSetting` holds `null`, `'always'` or `'never'`, and `useLeaderboardPostGame`
turns that into what the high-scores step renders:

| Decision   | Prompt      | Panel below the local scores                                                | The button that moves on                               |
| ---------- | ----------- | --------------------------------------------------------------------------- | ------------------------------------------------------ |
| `null`     | opens       | —                                                                           | "Select song"                                          |
| `'always'` | never opens | the identity being shared under, still editable, plus "Stop sharing scores" | "Share score and sing a song", holding for the request |
| `'never'`  | never opens | a one-line offer that reopens the prompt                                    | "Select song"                                          |

Accepting the prompt arms the score rather than sending it there and then, so the player lands on
the very panel every later song will show them and the send lives in one place. Closing the prompt
any way at all — the button, Backspace, the backdrop — declines for good; the panel's offer is the
way back, so nothing about that is a dead end.

An armed score is sent on the way out rather than on arrival, so the wait is never in the way of a
player who only wanted to see their score. "Stop sharing scores" returns the decision to `null`
rather than `'never'` — turning off automatic sharing is not the same as never wanting to be asked —
and clears the stored name and country. The `clientId` survives: it is the device, not the person.

## Feature flag and tests

The client is gated behind two PostHog flags. `leaderboard` covers the whole feature; the per-song
boards sit behind `song_leaderboard` on top of it, because they ship separately — the global board is
already live, and the per-song boards change a screen every player sees and bring a difficulty rule
of their own. `use-song-leaderboard-enabled.ts` returns false whenever `leaderboard` is off: there is
no per-song board to show when the feature it belongs to is off, and no prompt to collect a name
through.

Both are gated the same way. `useFeatureFlag` forces every flag on
under e2e, which would put the board into every existing spec and every main-menu screenshot, so
each hook consults an e2e-only opt-in instead (`enableLeaderboard` and `enableSongLeaderboard` in
`tests/helpers.ts`). That also gives the spec a real off-state to assert against.

- `worker/leaderboard-do.test.ts`, `worker/leaderboard.test.ts` — Durable Object and route
  behaviour, under `@cloudflare/vitest-pool-workers`. These live in the `functions` vitest project;
  `vite.config.mts` includes `worker/**/*.test.ts` there.
- `src/stories/post-game-scoreboards.stories.tsx` — the high-scores step in Storybook, with both
  scoreboards. The scores on that screen come from `GameState` and `PlayersManager` rather than from
  props, and the real ones are computed from sung notes, so the story seeds a sing setup and fixes
  each player state's score; `GET /leaderboard-song` is stubbed there too (there is no
  request-mocking addon), which is what makes the empty, loading and failed states reachable.
- `src/modules/leaderboard/notes-payload.test.ts` — encoder round-trip and payload size.
- `src/modules/elements/akui/select.spec.tsx` — the country picker, under `playwright-ct`.
- `tests/leaderboard.spec.ts` — sing → prompt → submit → the row appears on the main menu; the
  "always share" path across two songs; the per-song board and its position line on the post-game
  step; "Don't ask again" and the way back in; and both flag-off states.

  The first two are `test.fixme`: `getQualifyingScore()` scales the threshold down 1000x under e2e so
  the prompt opens, but `POST /leaderboard` enforces the real `QUALIFYING_SCORE`, and the stubbed
  microphone does not reliably clear it on Medium. Everything up to the submit passes; the row those
  two then look for may never have been stored. Seeding the board through the admin route, or scaling
  the Worker's threshold under e2e too, is what would bring them back.
