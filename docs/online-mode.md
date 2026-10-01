# Online Mode

Online mode lets people in different places sing the same song together. The room's authority runs
in the host's browser and its messages travel over the Cloudflare Realtime SFU, which is billed on
egress — a few MB per room — rather than by the second.

(It started life as a server-authoritative room on PartyKit, one WebSocket per client. That mode,
its deployment and the `OnlineP2P` feature flag that chose between the two are gone.)

### Room codes

A room code is five characters: a lead digit `2`–`9` and four lowercase letters
(`P2P_ROOM_CODE_PATTERN`). The lead digit is a leftover from when it told the two modes apart — `0`
and `1` are left out because they read as O and l. The Worker holds its directory to this pattern, so
a code of any other shape never reaches a Durable Object name. Now that nothing else claims the
all-letter codes, the generator could widen back to the whole alphabet.

## The shape of it

One participant is the **host**: the room's authority runs in their browser tab. Everyone else is a
client. Clients never talk to each other — they talk to the host, and the host tells them what the
room looks like. If the host disappears, the next singer in line takes over.

```text
Host browser                         Cloudflare                    Client browsers
────────────                         ──────────                    ───────────────
OnlineRoomLogic                                                    OnlineClient
  └─ OnlineRoomHost ── broadcast ──▶  Realtime SFU  ──fan-out──▶     └─ SfuClientTransport
  └─ (own OnlineClient               (forwards only)  ◀──slot──      └─ subscriptions / rpc
      over a loopback)
                                     Worker + OnlineDirectory
                                     (join / leave / promote only)
```

`OnlineRoomLogic` (`src/modules/online/protocol/room-logic.ts`) is unchanged from when it ran on a
server. It takes everything it needs from `OnlineRoomDeps`, so moving it into a tab only meant
supplying a different environment: `setTimeout` instead of a Durable Object alarm, a snapshot
broadcast instead of storage, one SFU publish instead of a per-socket fan-out.

## Why it is built this way

The previous design put a Durable Object in the middle of every message. That object stayed
resident for the length of every song, and duration is what Durable Objects are billed on — so the
bill grew linearly with how much the game was played.

The SFU is billed on egress instead ($0.05/GB, the first 1000 GB free), and online mode moves
almost nothing: room state, a leaderboard, ping and volume numbers. The song itself is a YouTube
video every client loads on its own, and the chart is a few compressed kilobytes sent once. A room
costs single-digit megabytes for a whole session.

Two properties of the SFU matter beyond price:

- **Fan-out.** The host publishes once and Cloudflare copies it to everyone, so the host's uplink
  does not grow with the room.
- **No peer-to-peer NAT traversal.** Every participant connects to Cloudflare, never to each other,
  so there are no direct connections to fail and no TURN relay to pay for.

## Channels

The host publishes one broadcast channel and one channel per slot:

| Channel  | Published by | Subscribed by            | Carries                                          |
| -------- | ------------ | ------------------------ | ------------------------------------------------ |
| `room`   | host         | everyone, read-only      | state pushes, heartbeats, succession snapshots    |
| `slot-N` | host         | one client, `canReply`   | that client's RPC calls and their replies         |

`canReply: true` makes a subscriber's channel bidirectional, which is what turns a slot into a
private duplex pipe. Cloudflare grants reply access to **one** subscriber per channel, and a later
grant revokes the earlier one — so two clients must never hold the same slot. That is the room
directory's job.

Slots are published up front, all `ONLINE_SLOT_COUNT` of them, because negotiated data channels
need no SDP renegotiation. Once a browser's transport is up, somebody joining costs one directory
call and one channel call, and no renegotiation at all.

### The transport handshake

Cloudflare's data-channel transport is offered by the SFU, not the browser — the order matters, and
getting it the other way round is what failed first in production:

1. `POST /online/session` (no body). The Worker calls `sessions/new` — with **no body**; the API
   rejects even `{}` — and then `datachannels/establish` with a single `remote` channel and no SDP.
   The SFU answers with an **offer**. The Worker returns it with the session id and an `answerToken`.
2. The browser sets that offer, creates its answer and sends it to `POST /online/session/answer`
   with the token. The Worker passes it on as `PUT renegotiate`, and the transport comes up.
3. Channels are then created with `datachannels/new` and opened as negotiated channels with the ids
   it returns. Each requested channel succeeds or fails on its own inside an HTTP 200, so the Worker
   checks every item and fails loudly on a refused one.

The `answerToken` is an HMAC of the session id keyed from the Realtime app token. Session ids are
not secret — a room's host session id is handed to anyone who asks for the room — so without it
anyone could renegotiate somebody else's transport with an answer of their own.

[Cloudflare's echo-datachannels example](https://github.com/cloudflare/realtime-examples/tree/main/echo-datachannels)
is the reference for all three steps. The end-to-end suite runs against a fake SFU that only mirrors
our reading of the API (see Testing), so `online-signaling.test.ts` pins the exact request of each
call against what the real API accepts.

The host learns which participant owns a slot from the `hello` frame each client sends first — the
SFU conveys the slot a frame arrived on and nothing else.

## What still runs on a server

One Durable Object per room code (`worker/online-directory-do.ts`), holding who is in the room,
which slot each of them owns, and who is hosting. It is touched on join, leave, host promotion and
a five-minute keepalive — never on the message path. A room wakes it for a handful of milliseconds
a few times per session instead of staying resident for every song.

The signaling endpoints (`worker/online-signaling.ts`) proxy SFU session and channel creation so
the Realtime app token never reaches a browser. They are the only endpoints that spend anything,
and none is behind a login, so they are rate-limited by IP — `/online/session` in particular takes
no input at all.

## Who a participant is

A participant id proves nothing. It is published to the whole room in `room-state` (that is how
every client computes the same succession order), so everyone who has been in a room knows
everyone else's.

So the directory mints a **membership secret** on a participant's first join, returns it to that
joiner alone, and requires it on everything that acts on that membership afterwards: rejoining it,
and promoting it. Without that, replaying somebody else's participant id at `join` would re-point
their row — moving the host's channels to whoever asked, or leaving any singer permanently unable
to open their own slot by pointing them at a session that does not exist. The browser keeps the
secret in `localStorage` next to the participant id and for the same reason: a room outlives
several page loads, and a singer who closes the tab and comes back is the same member.

Removing *somebody else* is separate, and gated on being the current host rather than on a secret —
`leave` carries the asking session and the directory checks it.

The host applies the same rule one level up, to the `hello` a client opens its slot with. The slot
a frame arrives on is trustworthy; the participant id inside it is not. A slot may name any
participant the room has not placed yet, and no participant it has placed somewhere else — the
host's own id included, which is the case the slot map cannot cover, since the host joins over the
loopback and never occupies a slot.

## Room standings

A room keeps two different scoreboards, and they answer different questions.

`leaderboard` is the song in progress: a sorted list of live scores each singer publishes once a
second, rebuilt from scratch at `startReadiness` and wiped on the way back to the lobby. It is what
the in-game overlay draws, and it is gone by the time the next song starts.

`standings` is the evening: `{ total, lastSong }` per participant id, and it survives the songs.
`enterResults` banks the finished song into it (`bankStandings`), reading the score off
`leaderboard` rather than recomputing it from `finalResults` — each client publishes its final score
immediately before its detailed one, and `forceResults` falls back to the same place, so the banked
number is the one everyone watched climb. It also keeps the room from having to interpret
`WireDetailedScore`, which this protocol deliberately treats as opaque.

Three consequences worth knowing:

- **A song somebody sat out empties their `lastSong`, and leaves their `total` alone.** The map is
  rebuilt on every bank rather than added to, so a singer who was away for the whole song — inside
  their reconnect grace, never on its leaderboard — shows a dash in the last-song column instead of
  somebody else's stale number. Someone who walked in halfway did not sit it out: their client
  publishes every second from the moment it is in the room, so they bank what they had reached.
- **A published score is pulled into `0..MAX_POINTS`, and a non-number is dropped.** The standings
  add it up for the rest of the evening, where it used to die with the song. The game engine reports
  `-1` for a player it doesn't have yet, which is what the clamp is for.
- **A song ended before it was sung banks nothing.** The host can end the game during the readiness
  check, which still goes through `enterResults`; banking only out of `singing` keeps that song's
  all-zero leaderboard from overwriting everybody's `lastSong`.
- **Leaving for good resets the score.** `removeParticipant` drops the standings row with the seat,
  so a singer who runs out their reconnect grace comes back to zero. A refresh does not: the grace
  window is exactly what tells the two apart. The lobby's panel lists singers from `participants`,
  never from `standings`, which is what makes somebody who left disappear from the board rather
  than lingering on it with a frozen score.

The standings are persisted with the rest of the snapshot, so a host takeover or a hibernation wake
does not reset the party's running totals — see `LatePersistedField` for why the field is optional.

## Host succession

Every client watches the host's heartbeat. Silence for `ONLINE_HOST_STALL_MS` means the host is
gone — a closed tab, or one throttled into the background, which is a real risk now that the
authority lives in a browser.

1. Each client waits its rank in the succession order (connected participants by `joinOrder`, the
   same ordering the room logic itself elects a host with) times `ONLINE_PROMOTE_STAGGER_MS`. The
   obvious successor therefore claims first and the rest only pile in if it turns out to be gone too.
2. It calls `promote` with its membership secret and the epoch it knows. The directory accepts only
   if that epoch is still current, so of two clients reacting to the same stall exactly one wins —
   and only if the secret matches, so the claim can only be made by the participant itself.
3. The loser's rejection carries the winner's session id — that is how it learns who to
   re-subscribe to, with no extra round trip.
4. The winner rebuilds `OnlineRoomLogic` from the last snapshot it received. That is the same code
   path the old server used for a hibernation wake, so a takeover resumes the song in progress
   rather than dropping everyone into the lobby.

The snapshot deliberately leaves out the compressed chart: it is the only large field, and every
singer already had to download it to sing. A successor restores it from `chart-cache.ts`.

The host that was replaced has to find out too, and nothing tells it: it does not read its own
broadcast, so the successor's heartbeats never reach it, and it stopped watching for a stall the
moment it became host. What it does have is the gap between its own heartbeat ticks. One longer
than `ONLINE_HOST_STALL_MS` means it was starved for as long as the room waits before replacing a
host, so it asks the directory who is in charge and steps down if the answer is not itself
(`verifyStillHosting`).

## The page-navigation constraint

The game is not a single-page app: moving between the lobby, the song and the results is a real
page load. That was free when the room lived on a server. With the authority in a browser it means
the room is destroyed several times per song, along with every client's succession state.

Two mitigations are in place:

- The host writes its snapshot to `sessionStorage` on `pagehide` and the reloaded page picks the
  room back up from it.
- Every client stores the newest snapshot it receives the same way, so a takeover right after a
  navigation still has something to restore from.

A host disappearing within a couple of seconds of starting a song used to lose the round: the
successor took over holding a *lobby*-phase snapshot, so `scoring.publishFinal` (which requires
`phase === 'singing'`) dropped the score and everyone landed back in the lobby.

The cause was the snapshot rate limit rather than the navigation. `broadcastSnapshot` thinned the
stream to one every `ONLINE_SNAPSHOT_BROADCAST_MS`, which drops precisely the wrong snapshot: a
phase change is the newest thing that has happened, so it falls inside the window and is held back
while the *previous* phase keeps going out. Starting a song is also when every tab is at its
busiest, so it is exactly when a host is likely to vanish.

The same limiter lost the room in the lobby, too. A singer who had joined, or changed colour, less
than a couple of seconds before the host left was holding a snapshot from before that change — or,
for a newcomer, no snapshot at all, in which case they took over by opening an empty room of their
own.

So the rule is now by caller rather than by content. Every time the room logic persists — a join or
leave, a colour, readiness, a playback transition, a final score — the snapshot goes out at once.
Those are discrete events, each already accompanied by a full room-state push, so the snapshot
alongside costs next to nothing. Only the heartbeat's refresh, which exists to carry the leaderboard
through a song, is limited to one per `ONLINE_SNAPSHOT_BROADCAST_MS`.

That change exposed a race in kicking: a kick removes the singer — which persists — before it
disconnects them, and slot bookkeeping used to run on the snapshot path, in between, dropping the
slot the eviction then needed to deliver the rejection on. It runs on the heartbeat now, which a
synchronous handler cannot be interrupted by.

`tests/online-mode.spec.ts` covers all three end to end ("host closing the tab mid-song…", "host
disconnect promotes the next-joined singer", "host can kick a singer…"), and
`online-room-host.test.ts` pins each rule directly.

Still worth doing: stop navigating altogether, keeping online mode on one page for the whole
lobby → song → results cycle, so neither the host's authority nor a client's succession state is
torn down mid-room. Everything else here is indifferent to that change.

## Testing

`room-logic.test.ts` was not touched by any of this — it drives the logic through a harness, which
is why the logic could move into a browser at all.

`online-room-host.test.ts` drives the host runtime against an in-memory fabric standing in for the
SFU, including a takeover from a snapshot.

There is no local emulator of Cloudflare Realtime, and a pull-request build has no credentials. So
the end-to-end suite and a checkout with no Realtime app both run against a fake SFU
(`tests/fake-sfu`): a werift peer implementing just the endpoints the Worker calls, with
Cloudflare's publish / subscribe / `canReply` routing. The Worker is pointed at it with placeholder
credentials and `REALTIME_API_URL` (see vite.config.mts):

- **e2e:** `playwright.config.ts` starts the fake on port 3480, and `E2E_FAKE_SFU_URL` makes the
  suite's dev server on port 3020 (`pnpm start:e2e`) and CI's e2e build use it.
- **local dev:** `pnpm start` starts the fake on port 3481 itself (`scripts/vite-plugin-fake-sfu.ts`)
  whenever `.dev.vars` holds no `REALTIME_APP_ID` / `REALTIME_APP_TOKEN`. Put a real pair there to use
  a real Realtime app instead.

Either way every P2P spec and every local room runs the production browser code end to end:
`SfuSession`, `SfuRoomConnection`, the Worker's Realtime calls, and everything above them. A Worker
with no credentials and no fake — a deployed Worker that lost its secrets, say — refuses the SFU
endpoints with a 503 rather than carrying messages some other way.

The fake is our reading of the API, not the API: it catches regressions in our own code, not a
misreading of Cloudflare's.

## ICE: STUN always, TURN opt-in

`GET /online/ice` is what the browser asks before opening its connection, rather than anything
compiled into the bundle — TURN credentials are short-lived and must not ship in a build.

**STUN needs no credentials of any kind.** Cloudflare's public servers are the default, so a
checkout with nothing configured connects fine; `ONLINE_STUN_URLS` points them elsewhere if you'd
rather not depend on Cloudflare.

**TURN is opt-in and most rooms never need it.** Every participant connects to the SFU rather than
to each other, so there is no peer-to-peer traversal to fail — TURN only matters on networks that
block UDP to the SFU outright. Two ways to enable it:

- **Cloudflare Realtime TURN** — `REALTIME_TURN_KEY_ID` + `REALTIME_TURN_API_TOKEN` (a separate key
  from the SFU app). The Worker mints short-lived per-client credentials and memoises them per key
  id. Billed on the same $0.05/GB with the same 1000 GB free tier as the SFU, and traffic between
  Realtime TURN and the Realtime SFU is not double-charged.
- **Your own TURN server** — `ONLINE_TURN_URLS` (+ `ONLINE_TURN_USERNAME` / `ONLINE_TURN_CREDENTIAL`).
  Static credentials handed to every client, so prefer the minted pair where you can.

If minting fails the endpoint degrades to STUN rather than failing the request: TURN serves a
minority of networks, and losing it must not stop everyone else joining.

## Configuration

| Setting                                                     | Required            | Where                                           |
| ----------------------------------------------------------- | ------------------- | ----------------------------------------------- |
| `REALTIME_APP_ID` / `REALTIME_APP_TOKEN`                     | production only     | `wrangler secret put`, `.dev.vars`              |
| `REALTIME_TURN_KEY_ID` / `REALTIME_TURN_API_TOKEN`           | no (opt-in TURN)    | `wrangler secret put`, `.dev.vars`              |
| `ONLINE_TURN_URLS` / `_USERNAME` / `_CREDENTIAL`             | no (own TURN)       | `wrangler secret put`, `.dev.vars`              |
| `ONLINE_STUN_URLS`                                           | no                  | defaults to Cloudflare's public STUN            |
| `VITE_APP_SIGNALING_URL`                                     | no                  | `.env`; empty means same origin                 |

Create the Realtime app in the Cloudflare dashboard under Realtime → SFU. Without the pair the
Worker's SFU endpoints answer 503; locally the dev server runs the fake SFU instead (see Testing).
Secrets belong to one Worker by name, so a preview deployed under its own name needs the pair set on it
too.

Local development: `pnpm dev` (or `pnpm start`) runs the vite dev server (with the Worker inside it, via
`@cloudflare/vite-plugin`, so `/online/*` is same-origin on port 3000), and with no credentials in
`.dev.vars`, the fake SFU beside it.
