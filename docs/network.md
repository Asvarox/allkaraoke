# Remote Mic Networking

This document describes the networking layer that connects phone microphones to the game host.

## Overview

The network layer lives in `src/modules/remote-mic/network/`. It is split into a **client** side (the phone) and a **server** side (the game host, running in the host browser tab). Messages flow over a WebSocket-like transport and are dispatched through a typed RPC system.

```
Phone (browser)                        Host (browser)
───────────────                        ──────────────
NetworkClient                          NetworkServer
  └─ transport (adapter)  ←──────────→  └─ transport (adapter)
  └─ rpc proxy                           └─ RpcServer
  └─ subscriptionManager                 └─ serverHandlers
  └─ ClientHandlers
```

## Transport Adapters

The actual WebSocket connection is provided by a swappable adapter. Both the client and server have matching adapter pairs:

| Adapter       | Client               | Server               | When used                                                           |
| ------------- | -------------------- | -------------------- | ------------------------------------------------------------------- |
| **PartyKit**  | `PartyKitClient.ts`  | `PartyKitServer.ts`  | Default; room IDs starting with `k` (Cloudflare Workers / PartyKit) |
| **Realtime**  | `realtime-client.ts` | `realtime-server.ts` | Room IDs starting with `r`; Cloudflare Realtime SFU data channels   |
| **WebSocket** | `WebSocketClient.ts` | `WebSocketServer.ts` | Room IDs starting with `w`; direct WebSocket server                 |
| **PeerJS**    | `PeerJSClient.ts`    | `PeerJSServer.ts`    | Legacy peer-to-peer WebRTC                                          |

The client selects an adapter based on the room ID prefix in `NetworkClient.connect()`. The game picks
the transport when it first starts its server in a session and keeps it for as long as the game code
lives (`NetworkServer.latchTransport`), so a flag answer that arrives later never strands phones already
holding the code. Only switching it in the Remote Microphone settings moves a running game onto another
transport, and that changes the code.

### Choosing the transport

`RemoteMicConnectionTypeSetting` is the transport new game codes are made with. In production it is set
from PostHog: the `remote_mics_realtime` flag (a percentage rollout) picks Realtime, otherwise the
`remote_mics_connection_type` payload, otherwise PartyKit. Dev defaults to Realtime (the dev server runs
the fake SFU); e2e defaults to PartyKit, and a spec opts into Realtime with `useRealtimeRemoteMics`.

### Realtime

The Realtime transport shares online mode's Realtime layer — `SfuRoomConnection` and friends in
`src/modules/network/realtime/`, and `createRealtimeSignaling` plus the `RoomDirectory` Durable Object
in `worker/realtime/` (see `online-mode.md`) — but mounts its own copy: signaling under
`/remote-mic-signaling/` and its own `RemoteMicDirectory`, so its rooms never mix with online ones. Both
run on the same Realtime app and credentials (`REMOTE_MIC_REALTIME` vs `ONLINE_REALTIME`). The game
code (`r` plus four letters) is the directory room; the game hosts it and publishes a broadcast channel
plus `REMOTE_MIC_SLOT_COUNT` slot channels, and each phone replies on its own slot. Frames are msgpack.
Differences from an online room:

- The game is always the host: a remote-mic room never promotes a phone or elects one when the host
  leaves.
- A phone's first frame is `rt-hello` with its id, which is how the game maps a slot to a phone.
- The game broadcasts `rt-hb` every 2s. A reloaded game just stops publishing, so a phone treats 10s of
  silence as a closed connection and reconnects. `rt-close` closes a phone on purpose (`player-removed`,
  or `host-closed` as the game unloads, so phones reconnect without waiting out the silence).
- Memberships survive reloads on both sides (secrets in `localStorage`). The game hands a slot back
  after 10 minutes of silence from its phone, so a long party does not run out of slots.

## Analytics

Both transports report the same events, with `transport` (the code's lead letter) and `transportName`:

| Event                                       | Side  | When                                                 |
| ------------------------------------------- | ----- | ---------------------------------------------------- |
| `remote_mic_connection_successful`          | phone | connected (also after a reconnect)                   |
| `remote_mic_connection_error`               | phone | the first connection attempt failed, with `reason`   |
| `remote_mic_connection_lost`                | phone | an established connection dropped, with `reason`     |
| `remote_mic_song_ping`                      | phone | once per song sung on the phone                      |
| `remote_mic_server_connected`               | game  | the game's transport came up (`transport` is a name) |
| `remote_mic_server_connection_error`/`lost` | game  | the game's transport failed / dropped                |

`remote_mic_song_ping` summarises every ping of the song (`samples`, `timeouts`, `min`, `max`, `avg`,
`median`, `p95`, `jitter`, in ms). The game brackets each song with `songStarted` / `songEnded` client
calls, and only a phone the game monitored during the song reports. Online mode reports the same summary
per singer per song as `onlineSongPing`.

Both sides implement a common interface (`Client/Transport/interface.ts`, `Server/Transport/interface.ts`) so `NetworkClient` and `NetworkServer` are transport-agnostic.

## RPC System

Most communication between phone and host goes through a typed RPC layer rather than raw message handling.

### Server handlers

Handlers are defined in `Server/serverHandlers.ts` using two factory helpers from `Rpc/define.ts`:

- **`defineQuery`** — read-only, defaults to `'read'` permission (any connected client can call it)
- **`defineMutation`** — side-effecting, defaults to `'write'` permission (only clients with write permission)

Handlers are grouped into namespaces.

### Client proxy

On the phone side, `createRpcProxy<typeof serverHandlers>()` (`Rpc/RpcClient.ts`) builds a nested Proxy that mirrors the server handler contract. Calls are serialized to wire messages and resolved asynchronously (with a timeout):

```ts
const result = await Client.rpc.songs.getSongList();
await Client.rpc.input.keystroke('ArrowRight');
```

TypeScript infers the argument and return types directly from `serverHandlers`, so there is no manual type duplication.

### Wire protocol

```
Client → Server   { t: 'rpc', ns, method, args, id }
Server → Client   { t: 'rpc-res', id, result?, error? }

Server → Client   { t: 'rpc-call', method, args }        ← server-initiated call

Client → Server   { t: 'rpc-sub', channel }              ← subscribe to a push channel
Server → Client   { t: 'rpc-pub', channel, data }        ← push update to subscribers
Client → Server   { t: 'rpc-unsub', channel }            ← unsubscribe
```

### Server → client calls

The server can also initiate calls to the phone using `RpcServer.callClient()`. Handlers for these are registered on the phone with `registerClientHandler(method, fn)` and exposed via the `ClientContract` interface (`Client/clientContract.ts`). This is used for things like `setPlayerNumber`, `setPermissions`, `requestReadiness`, and `reload`.

### Push subscriptions

For server-pushed state (e.g. the live list of connected mics), the phone subscribes to a named channel. `ClientSubscriptionManager` (`Client/subscriptions.ts`) tracks ref-counts, caches the last received value (delivered immediately to new subscribers), and re-sends subscriptions on reconnect. React components use the `useSubscription` hook to consume these channels.

## Performance-Critical Messages (outside RPC)

A handful of message types bypass RPC entirely because they are sent at high frequency and latency matters:

| Message         | Direction     | Purpose                                                              |
| --------------- | ------------- | -------------------------------------------------------------------- |
| `freq`          | phone → host  | Batched pitch/frequency data; throttled to ~60 Hz, sent every ~50 ms |
| `ping` / `pong` | bidirectional | Round-trip latency measurement                                       |
| `register`      | phone → host  | Initial handshake on connect                                         |
| `unregister`    | phone → host  | Clean disconnect                                                     |
| `register-room` | host → phone  | Associates the connection with a room                                |

These are defined as plain interfaces in `Network/messages.ts` and handled directly in `NetworkClient` / `NetworkServer` without going through the RPC dispatcher.

## React Hooks

Four hooks wrap the RPC layer for use in React components (all in `Client/hooks/`):

| Hook                           | Purpose                                                                          |
| ------------------------------ | -------------------------------------------------------------------------------- |
| `useServerQuery(fn, deps)`     | Runs a query on mount and reconnect; returns `{ data, loading, error, refetch }` |
| `useServerMutation(fn)`        | Returns a stable `mutate` function with `loading`/`error` state                  |
| `useSubscription(channel)`     | Subscribes to a push channel; returns the latest data                            |
| `useClientHandler(method, fn)` | Registers a handler for a server → client call; auto-unregisters on unmount      |
