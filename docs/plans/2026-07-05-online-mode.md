# Online Mode With PartyKit

## Summary

Build a separate online mode driven by a standalone PartyKit room, reusing song browsing, singing, scoring, and post-game presentation where practical. Party mode and remote-mic networking stay separate.

Key decisions locked:
- Online v1 supports up to 6 singers.
- Each participant uses their local browser microphone.
- The host's selected song is always transferred as a serialized chart (via `convertSongToTxt`), regardless of whether it is a built-in, shared, or local song. Clients reconstruct the song from the transferred chart and load the referenced YouTube media themselves. No song audio/video is uploaded.
- Everyone sings the merged full vocal line, as if singing solo (`GameState.isMergedTrack()` / `song.mergedTrack`).
- The PartyKit room owns room/playback state; each browser scores itself locally and publishes score snapshots.
- Each client runs the existing calibration step once before singing; the locally computed score is authoritative and is what gets published. This is for fun, not competitive play, so per-device latency differences are acceptable.
- Before starting, every connected singer must (a) ready up and (b) pass a playback probe confirming their browser can play the video. The server then runs a synchronized countdown.
- Pause policy: **any** connected singer can pause, and **any** connected singer can resume. Buffering pauses use a configurable threshold and auto-resume.

## Deployment: standalone PartyKit project

The existing remote-mic networking already connects to a **separate** PartyKit deployment (`VITE_APP_PARTYKIT_URL`, e.g. `wss://allkaraoke-partykit.asvarox.partykit.dev`) that is **not** part of this repo's Cloudflare Worker. This repo's [worker/index.ts](/Users/olek/karaoke-test/worker/index.ts) is a Pages-style function router with no Durable Objects, and [wrangler.jsonc](/Users/olek/karaoke-test/wrangler.jsonc) has no DO bindings. **Do not** add the room server there.

Instead, create a new standalone PartyKit project the same way as the [PartyKit quickstart](https://docs.partykit.io/quickstart/):
- Add `partykit.json` with a `main` entry pointing at the online room server (e.g. `partykit/online-room.ts`) and a party name (e.g. `online`).
- Implement the room as a PartyKit `Server` (`onConnect`, `onMessage`, `onClose`, `onAlarm` for TTL cleanup) using PartyKit room storage for persistence.
- Deploy separately (its own `partykit deploy`); expose its URL via a new env var (e.g. `VITE_APP_ONLINE_PARTYKIT_URL`) so it can be a different instance from the remote-mic one.

This keeps online mode fully decoupled from the remote-mic PartyKit server and from the Cloudflare Worker.

## Transport & RPC reuse

Reuse the **generic** RPC machinery in [src/modules/remote-mic/network/rpc/**](/Users/olek/karaoke-test/src/modules/remote-mic/network/rpc) — `defineQuery`/`defineMutation` ([define.ts](/Users/olek/karaoke-test/src/modules/remote-mic/network/rpc/define.ts)), `RpcServer` ([rpc-server.ts](/Users/olek/karaoke-test/src/modules/remote-mic/network/rpc/rpc-server.ts)), `RpcClient`, and the wire message shapes in [types.ts](/Users/olek/karaoke-test/src/modules/remote-mic/network/rpc/types.ts). The **events/API exposed through RPC must be separate** from remote-mic's.

The RPC core is nearly generic but currently coupled to remote-mic in a few spots; decouple these so both features can share it while exposing different APIs:
- [types.ts](/Users/olek/karaoke-test/src/modules/remote-mic/network/rpc/types.ts) imports `SubscriptionChannels` from remote-mic's [client/subscriptions.ts](/Users/olek/karaoke-test/src/modules/remote-mic/network/client/subscriptions.ts). Parameterize the channel/publish types (generic over a `SubscriptionChannels` map) instead of hard-importing the remote-mic one.
- [rpc-server.ts](/Users/olek/karaoke-test/src/modules/remote-mic/network/rpc/rpc-server.ts) imports remote-mic `NetworkMessages` and `SenderInterface`. Make the RPC core generic over the message/sender types (or move the shared transport/RPC primitives into a neutral location), leaving remote-mic and online to supply their own message unions.
- `ClientSubscriptionManager`/`subscriptionManager` is a remote-mic singleton; online gets its own instance/channels.

Online then defines its own namespaces/handlers (room, selection, playback, scoring), its own subscription channels (e.g. `room-state`, `leaderboard`), and its own client-facing contract via `ExtractContract`. Reuse the existing `pack`/`unpack` and ping/latency utilities. Do **not** import remote-mic's application handlers or its forwarding/relay protocol — remote-mic is a hub-and-spoke relay, whereas the online room is authoritative.

## Client module

Add `src/modules/online/**` for the online room protocol: typed message/channel definitions, client connection hook, clock-offset estimation, score publishing, song (chart) transfer, and a room-state reducer. Do not import or reuse `src/modules/remote-mic/network/client/**` application code (transport/RPC core is shared per the section above).

## Routes & menu

- Add online routes using **query params** (not path params): a create/join screen at `/online`, and the room lobby/singing/results at `/online?room=CODE`. Add `ONLINE: 'online'` to [route-paths.ts](/Users/olek/karaoke-test/src/routes/route-paths.ts) and a main-menu entry. Query params avoid the dynamic-segment build/prerender + 404-fallback handling that `route-paths.ts` warns about.
- Screens: create/join, room lobby with per-participant song browser + host selection, ready/probe/countdown, singing (local game + leaderboard overlay), and online results.

## Non-invasive singing integration

Avoid a large refactor of the `GameState`/`PlayersManager` singletons and the global event bus. Instead:
- Online singing runs the **existing single-player local game path unchanged**, with the transferred song as one local singer (`playerNumber: 0`, merged track). The online layer only starts/stops that local game from authoritative room commands.
- Overlay a live leaderboard rendered from room score snapshots (published via the online subscription channel); it is presentational and does not touch `GameState`.
- Keep local party mode behavior unchanged. The only shared-primitive change required is centralizing the player-number type/config and expanding colors (below) — needed so the 6-player leaderboard/result display can render, not to re-architect the game loop.

## Player primitives for 6 players

- Introduce a central `PlayerNumber` type + `MAX_PLAYERS`/config instead of the scattered `0 | 1 | 2 | 3` literals in [interfaces.ts](/Users/olek/karaoke-test/src/interfaces.ts), [players-manager.ts](/Users/olek/karaoke-test/src/modules/players/players-manager.ts) (`MAX_PLAYERS = 4`), [game-events.ts](/Users/olek/karaoke-test/src/modules/game-events/game-events.ts), [canvas-drawing.ts](/Users/olek/karaoke-test/src/modules/game-engine/drawing/canvas-drawing.ts), [calculate-data.ts](/Users/olek/karaoke-test/src/modules/game-engine/drawing/calculate-data.ts), and stories.
- Expand player colors from 4 to 6 in each theme (`regular`, `christmas`, `eurovision`, `halloween`) in [styles.ts](/Users/olek/karaoke-test/src/modules/game-engine/drawing/styles.ts), and expand result-display support to 6.
- Keep local party mode capped at its current player count unless a change is explicitly needed.

## Room Protocol

- Room state includes participants, host election order, selected song (transferred chart), difficulty, mode (`DUEL` only), readiness, playback-probe status, countdown, playback state, pause blockers, leaderboard, and final result snapshots.
- Participant lifecycle:
  - client stores a stable participant ID locally;
  - reconnect grace keeps join order and avoids host churn on refresh;
  - room cap is `ONLINE_MAX_PLAYERS = 6`; reject the 7th;
  - host is the earliest-joined connected participant after grace expiry.
- Song selection:
  - the host's chosen song is serialized via `convertSongToTxt`, transferred in chunks with a manifest/hash, reconstructed on each client, and persisted in room storage until room TTL;
  - one code path for all song sources (built-in, shared, local) — always transfer the chart;
  - define `ONLINE_MAX_CHART_BYTES` and error on oversized charts; support late-join loading from room storage.
- Playback readiness probe (v1 sync strategy):
  - after all singers ready up, each client loads/cues the YouTube video and reports whether it can play (buffered enough / not blocked);
  - the server only begins the countdown once every connected singer reports playable within a timeout; if a singer fails/times out, surface it in the lobby and do not start;
  - this is intentionally simple and will be iterated on.
- Playback:
  - server sends authoritative countdown/start/pause/resume commands with server timestamps;
  - clients estimate clock offset and seek if drift exceeds a configurable threshold;
  - clients report `playing`, `paused`, `buffering/stalled`, current time, and score snapshots.
- Pause policy:
  - any connected singer can pause; pause applies to everyone immediately;
  - any connected singer can resume;
  - buffering pauses only after `ONLINE_BUFFERING_PAUSE_MS`;
  - auto-resume after all connected singers report playable, with a short resume countdown.

## Scoring

- Each client runs the existing calibration step once before singing (as today), then scores locally via the existing `calculateScore` path and publishes score snapshots. The published score is authoritative — no server-side recomputation.

## Post-game

- Reuse the animated result breakdown to show each player's performance from the final room snapshots.
- Skip local high-score/leaderboard persistence for online games ("no leaderboard at the end" = no high-score step; the breakdown still shows per-player results).

## Test Plan

- Unit-test room reducer/server behavior: create/join, 6-player cap, reject 7th, reconnect grace, host migration, selection reset, ready + playback-probe gating, countdown, pause policy (any pause / any resume), score updates, final results, and TTL cleanup.
- Unit-test chart transfer: chunking, hash validation, storage reconstruction, oversized-chart error, and late-join loading.
- Unit-test the RPC-core generalization: remote-mic behavior unchanged after decoupling `SubscriptionChannels`/message types; online contract types resolve via `ExtractContract`.
- Component-test online lobby/song-selected panel with host/non-host states, 6 participants, ready + probe statuses, countdown, live leaderboard, and results without the high-score step.
- E2E with multiple Playwright pages, reusing existing `mockSongs` + mic mocking and stubbing YouTube:
  - create room, join by link/code (query param), set names;
  - everyone browses independently while the host's selection box updates;
  - host selects a built-in song and a local chart song (both go through chart transfer);
  - all ready + all probe-playable triggers countdown and synchronized start;
  - live leaderboard updates;
  - any player pause/resume affects all; buffering pauses per policy;
  - host disconnect promotes the next-joined participant;
  - final screen shows the result breakdown and no high-score leaderboard.
- Verification commands: `pnpm type-check`, targeted `pnpm test`, targeted Playwright online spec, then `pnpm build`.

## Assumptions And Notes

- Binary media transfer is out of scope for v1; chart/metadata transfer is enough for current songs.
- The v1 playback-sync strategy (readiness probe + authoritative start + drift-seek) is deliberately minimal and expected to be iterated. Known YouTube risks left for later: mid-song ads on some clients, region/age-restricted or embedding-disabled videos.
- Scoring is not calibrated across devices beyond each client's own one-time calibration; acceptable for a for-fun mode.
- Standalone PartyKit project references: [PartyKit quickstart](https://docs.partykit.io/quickstart/), plus PartyServer/PartySocket API docs.
