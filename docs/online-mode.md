# Online Mode

Online mode lets people in different places sing the same song together. This document describes
how it is wired after the move off a hosted room server.

## The shape of it

One participant is the **host**: the room's authority runs in their browser tab. Everyone else is a
client. Clients never talk to each other — they talk to the host, and the host tells them what the
room looks like. If the host disappears, the next singer in line takes over.

```
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
need no SDP renegotiation. Somebody joining costs two signaling calls and no renegotiation at all.

The host learns which participant owns a slot from the `hello` frame each client sends first — the
SFU conveys the slot a frame arrived on and nothing else.

## What still runs on a server

One Durable Object per room code (`worker/online-directory-do.ts`), holding who is in the room,
which slot each of them owns, and who is hosting. It is touched on join, leave, host promotion and
a five-minute keepalive — never on the message path. A room wakes it for a handful of milliseconds
a few times per session instead of staying resident for every song.

The signaling endpoints (`worker/online-signaling.ts`) proxy SFU session and channel creation so
the Realtime app token never reaches a browser.

## Host succession

Every client watches the host's heartbeat. Silence for `ONLINE_HOST_STALL_MS` means the host is
gone — a closed tab, or one throttled into the background, which is a real risk now that the
authority lives in a browser.

1. Each client waits its rank in the succession order (connected participants by `joinOrder`, the
   same ordering the room logic itself elects a host with) times `ONLINE_PROMOTE_STAGGER_MS`. The
   obvious successor therefore claims first and the rest only pile in if it turns out to be gone too.
2. It calls `promote` with the epoch it knows. The directory accepts only if that epoch is still
   current, so of two clients reacting to the same stall exactly one wins.
3. The loser's rejection carries the winner's session id — that is how it learns who to
   re-subscribe to, with no extra round trip.
4. The winner rebuilds `OnlineRoomLogic` from the last snapshot it received. That is the same code
   path the old server used for a hibernation wake, so a takeover resumes the song in progress
   rather than dropping everyone into the lobby.

The snapshot deliberately leaves out the compressed chart: it is the only large field, and every
singer already had to download it to sing. A successor restores it from `chart-cache.ts`.

## The page-navigation constraint

The game is not a single-page app: moving between the lobby, the song and the results is a real
page load. That was free when the room lived on a server. With the authority in a browser it means
the room is destroyed several times per song, along with every client's succession state.

Two mitigations are in place:

- The host writes its snapshot to `sessionStorage` on `pagehide` and the reloaded page picks the
  room back up from it.
- Every client stores the newest snapshot it receives the same way, so a takeover right after a
  navigation still has something to restore from.

**Known gap.** These cover a host navigating normally. They do not yet cover a host *disappearing*
around the same moment a client is navigating — `tests/online-mode.spec.ts` "host closing the tab
mid-song still lets the round finish and promotes the guest" fails: the successor takes over
holding a lobby-phase snapshot, so `scoring.publishFinal` (which requires `phase === 'singing'`)
drops the score and the round ends in the lobby instead of the results.

The durable fix is to stop navigating: keep online mode on one page for the whole lobby → song →
results cycle, so neither the host's authority nor a client's succession state is ever torn down
mid-room. Everything else here is indifferent to that change.

## Testing

`room-logic.test.ts` was not touched by any of this — it drives the logic through a harness, which
is why the logic could move at all.

`online-room-host.test.ts` drives the host runtime against an in-memory fabric standing in for the
SFU, including a takeover from a snapshot.

The end-to-end suite has no Cloudflare Realtime app to talk to — there is no local emulator, and a
pull-request build has no credentials. So the Worker reports `dataPlane: 'relay'` when Realtime is
unconfigured and the client opens a WebSocket relay through the room's Durable Object instead
(`relay-room-connection.ts`). This is deliberately the expensive shape — a server in the middle of
every message — and production can never take it: the Worker refuses the upgrade whenever the SFU
is configured. What it buys is that everything above `OnlineRoomChannels` is the production code
path under test: the room logic, the host runtime, slot binding and the whole succession flow.

The same fallback makes a local checkout work with no Realtime credentials at all.

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

Create the Realtime app in the Cloudflare dashboard under Realtime → SFU. Without the pair, online
mode still runs — on the relay — which is fine locally and wrong in production.

Local development: `pnpm start` is the whole thing. The `@cloudflare/vite-plugin` runs the Worker
inside the dev server, so `/online/*` is served same-origin on port 3000 with no second process.
