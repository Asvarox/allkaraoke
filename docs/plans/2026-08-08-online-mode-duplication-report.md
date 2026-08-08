# Online Mode — Code Duplication Report

Scope: everything on `online-mode` that is not on `master` (`git diff master...HEAD`, ~115 files,
+5877/-378), plus the pre-existing code it duplicates. Focus is maintainability, especially the
boundary between **local game mode** and **online game mode**.

This is an analysis document only — nothing here has been implemented. Each finding states what is
duplicated, where, why it matters, and a concrete extraction proposal. Findings are ordered by
value: **P1** = duplication that will drift and cause visible bugs, **P2** = worth extracting,
**P3** = cleanup / consistency.

Things the branch already did well (do **not** undo these): `MicCheckSlotShell`, `useMicSwitcher`,
`useMicMonitoring`, `PlayerNumber`/`MAX_PLAYERS` centralization, the RPC-core generalization
(`RpcSenderInterface`, `RpcClientTransport`, `AnySubscriptionChannels`, generic
`ClientSubscriptionManager`), `WizardChecklist` promotion to `akui`, and the
`cameraEnabled`/`skipIntroEnabled`/`onSkipIntro` parameterization of the local singing components.
Several findings below are about *finishing* those extractions rather than starting new ones.

---

## P1 — Local ↔ Online duplication that will drift

### 1.1 The "singer row" is assembled four separate times

`MicCheckSlotShell` was extracted correctly, but every caller re-implements the same wiring around
it: stats lookup, vote resolution, local-vs-remote volume selection, and the badge/action cluster.

| File | Lines | What it renders |
|---|---|---|
| `src/routes/online/lobby/participant-list.tsx` | 29–101 | lobby singer rows + free slots |
| `src/routes/online/lobby/song-players-panel.tsx` | 23–40 | same rows inside the song browser |
| `src/routes/online/singing/pause-overlay.tsx` | 63–101 | same rows, `size="compact"` |
| `src/routes/online/singing/readiness-overlay.tsx` | 84–112 | same rows + ready tick |

Literally repeated fragments:

- Vote resolution, verbatim in 2 files (`participant-list.tsx:48-49`, `song-players-panel.tsx:24-25`):
  ```ts
  const vote = votes[participant.id];
  const voteForThisSong = vote && vote.songId === preview?.songId ? vote.vote : null;
  ```
- Volume source selection, in 3 files (`participant-list.tsx:69`, `pause-overlay.tsx:82`,
  `readiness-overlay.tsx:105-109`):
  ```ts
  volume={isSelf ? { type: 'local' } : { type: 'remote', volume: stats[participant.id]?.volume ?? 0 }}
  ```
  …each with its own copy of the same three-line explanatory comment.
- The host's kick button, twice (`participant-list.tsx:88-97` and `pause-overlay.tsx:88-97`) —
  same `data-test`, same `title`, same handler, but one renders
  `<Icon icon="ic:baseline-close" />` and the other a literal `✕`, and the hover classes differ.
  That divergence is already a visual inconsistency between the lobby and the pause menu.

**Recommendation.** Add `src/routes/online/components/participant-slot.tsx`:

```tsx
interface Props {
  participant: OnlineParticipant;
  selfId: string;
  hostId: string | null;
  size?: 'regular' | 'compact';
  showVote?: boolean;          // lobby + song browser
  showPing?: boolean;
  onKick?: (p: OnlineParticipant) => void;   // host-only, rendered by the shell
  onEdit?: () => void;                        // own row only
  children?: ReactNode;                       // screen-specific extras (score, ready tick)
}
```

It owns: `useOnlinePlayersStats`/`useOnlineSongVotes`/`useOnlineSongPreview` reads, the
local-vs-remote volume decision, `ParticipantBadges`, the host/you/disconnected `Tag`s, and both
action buttons. Add a `useParticipantVote(participantId)` hook next to it for the vote resolution.
The four call sites then shrink to a `.map()` plus their own extras. Keep `MicCheckSlotShell` as-is
underneath — it is the right primitive; `ParticipantSlot` is the online-flavoured layer on top.

### 1.2 Score formatting duplicated between the two places that show a live score

- `src/routes/online/singing/leaderboard-overlay.tsx:7` — `const formatScore = (score) => Math.max(0, Math.floor(score)).toLocaleString('en')`
- `src/routes/online/singing/pause-overlay.tsx:86` — the same expression inline

Both are on screen at overlapping moments (pause menu over the leaderboard), so a formatting change
in one produces two different renderings of the same number.

**Recommendation.** Move `formatScore` to `src/modules/online/format-score.ts` (or reuse whatever
`post-game/views/results/player-score.tsx` uses, if it should match the results screen) and import
in both. Check whether the local game's score display (`game-overlay/components/score-text.tsx`)
should use it too — if the intent is that online and local show scores identically, this is the
place to enforce it.

### 1.3 `SongHoverPreview` payload built twice, already out of sync

The wire payload describing "the song on screen" is constructed independently in two places:

- `src/routes/online/lobby/lobby.tsx:86-98` (host hovering in the browser → `selection.setPreview`)
- `src/modules/online/client/song-transfer.ts:38-47` (host confirming → `selection.setChart`)

Both repeat the non-obvious fallbacks:
`previewStart: song.previewStart ?? (song.videoGap ?? 0) + 60`, `volume: song.volume ?? song.manualVolume`,
`mode: 'Duel'`.

**They have already drifted**: the lobby version sends `artistOrigin`, `song-transfer.ts` does not.
`LobbySongHeader` passes `artistOrigin` to `<SongFlag>` (`lobby-song-header.tsx:110`), so after the
host *confirms* a song the flag rendering can change versus while they were *hovering* it.

**Recommendation.** One function in `src/modules/online/client/song-preview.ts`:

```ts
export const toSongHoverPreview = (
  song: Pick<SongPreview, 'id'|'artist'|'title'|'video'|'language'|'artistOrigin'|'year'|'previewStart'|'previewEnd'|'volume'|'videoGap'> & { manualVolume?: number },
  difficulty?: string,
): SongHoverPreview => ({ … });
```

Call it from both sites. `Song` and `SongPreview` both structurally satisfy the input, so one
signature covers both callers.

### 1.4 Song loading for transfer duplicates `useSong`, and loses metadata doing it

`src/modules/online/client/song-transfer.ts:13-25` (`loadSongForUpload`) is a re-implementation of
the loader inside `src/modules/songs/hooks/use-song.ts:17-40`: same `sourceType === 'unverified'`
branch, same `getUnverifiedSongById` → `convertTxtToSong(txt.replaceAll('\\n', '\n'))` → `processSong`,
same `SongDao.get` fallback.

The copy is **not** equivalent: `useSong` stamps
`{ local: false, sourceType: 'unverified', sharedSongId, isUnverifiedSong: true }` onto the parsed
song; `loadSongForUpload` does not. Anything downstream that keys off `isUnverifiedSong` (e.g. the
pause menu's forced rating flow, `pause-menu.tsx:76-84`) behaves differently for a shared song sung
online. Also note the online path serializes to txt and re-parses on every client, so the metadata
is lost a second time on the receiving side — worth deciding deliberately rather than by omission.

**Recommendation.** Extract `loadSongById(songId, { sourceType, sharedSongId }): Promise<Song | null>`
into `src/modules/songs/load-song.ts`, containing the metadata stamping. Then:
`useSong` = `useState` + `useEffect` around it; `loadSongForUpload` = the same call plus the
"throw when missing" wrapper. Preserve current behaviour for local mode exactly.

### 1.5 The in-game settings block is re-implemented for the online pause overlay

`src/routes/online/singing/pause-overlay.tsx:104-105` renders a raw `Switcher` (mic) plus `InputLag`.
The local pause menu already offers exactly these (`game-overlay/components/pause-menu.tsx:111-113`
mic settings modal, `:116` input lag via the dedicated `PauseMenuInputLag` wrapper, `:127-131` the
`SelectInputModal`).

The local file carries a 9-line comment (`pause-menu.tsx:22-30`) explaining that `InputLag` **must**
be registered from its own component's render, or it jumps to the front of the keyboard-navigation
list and of the remote-mic mirrored control list. The online copy registers inline
(`pause-overlay.tsx:105`) and therefore has exactly the bug that comment warns about — the input-lag
entry is registered before the singer rows and the resume button.

**Recommendation.** Extract `<InGameAudioSettings />` (mic switcher + input-lag row, each registering
from its own render) into `src/routes/settings/in-game-audio-settings.tsx`, and use it from both
pause surfaces. This is a correctness fix as well as a de-duplication.

### 1.6 The results screen shell is rebuilt for online

`src/routes/online/results/online-results.tsx:43-56` reproduces the shell of
`src/routes/game/singing/post-game/post-game-view.tsx:41-70` + `post-game.tsx:32-54`:
`LayoutGame` → `SongPage songData width height` → `div.flex.flex-1.flex-col.gap-2` → `ResultsView`,
plus `useBackgroundMusic(true)` in both.

Differences that look accidental rather than intended: the online screen drops the `<GameTip>` and
the "Background music by FesliyanStudios" credit that `PostGameView` renders (`:55-68`). The credit
in particular is an attribution obligation that now depends on which mode you played.

Both also build the `PlayerScore[]` array and a `SingSetup` from their own source
(`post-game.tsx:22-30` from `PlayersManager` + `GameState`; `online-results.tsx:23-41` from
`roomState.finalResults`) — that part is legitimately different and should stay.

**Recommendation.** Give `PostGameView` two props — `highScoresEnabled?: boolean` (default `true`;
when `false` the results step's `onNextStep` calls `onClickSongSelection` and the `highscores` step
is never entered) and `cameraEnabled?: boolean` (forwarded to `ResultsView`, which already accepts
it since `views/results.tsx:19`). `OnlineResults` then becomes score-mapping plus a `PostGameView`
render, and the tip/credit come back for free.

---

## P2 — Online ↔ remote-mic duplication (both are "second screen joins a room" flows)

### 2.1 Wizard step machinery implemented twice

`src/routes/online/setup-wizard.tsx:56-152` and
`src/routes/remote-mic/panels/microphone/connection-wizard/connection-wizard.tsx:46-228` both:

1. compute a step order that drops steps for a remembered name / prior calibration
   (`setup-wizard.tsx:62-69` vs `connection-wizard.tsx:220`),
2. derive `completedSteps` by taking the steps before the current one
   (`setup-wizard.tsx:118-120` vs `connection-wizard.tsx:221-224`),
3. special-case the code step's completed label to show the code it connected with
   (`setup-wizard.tsx:113-116`: `Joining room: ${code.toUpperCase()}` vs
   `connection-wizard.tsx:213-216`: `Connected to game: ${code.toUpperCase()}`),
4. feed `WizardChecklist`.

Only the transition mechanism differs (motion crossfade vs View Transitions API).

**Recommendation.** Extract `useWizardSteps<TStep>({ steps, labels, completedLabel })` into
`src/modules/elements/akui/` next to `wizard-checklist.tsx`, returning
`{ step, next, previous, completedSteps, activeStep }`. Both wizards keep their own step components
and their own transition wrapper. Do not try to unify the transitions — the remote mic's
view-transition CSS is phone-specific.

### 2.2 Two persisted-display-name hooks

- `src/routes/online/hooks/use-online-name.ts` (storage.local + trim + `MAX_NAME_LENGTH` slice)
- `src/routes/remote-mic/hooks/use-remote-mic-name.ts` (`use-persisted-state` + generated dummy name)

Same return shape `{ name, hasStoredName, setName }`; the online file's own docstring says "same
behaviour as the remote mic's `useRemoteMicName`". The trim/slice normalization exists only in the
online one, so the two disagree on what a valid stored name is.

**Recommendation.** `usePersistedDisplayName(storageKey, { fallback?: () => string })` in
`src/modules/hooks/`, with the trim + max-length normalization applied in both. Keep the module-level
cached dummy name behaviour behind the `fallback` option (remote mic passes it, online does not).
Note the standalone `getStoredOnlineName`/`setStoredOnlineName` exports are needed outside React
(`online-room.tsx:37`, `customize-modal.tsx:46`) — the shared module should expose the same pair.

### 2.3 Room-code generation duplicated

- `src/routes/online/setup-wizard.tsx:19-25`
- `src/modules/remote-mic/network/server/network-server.ts:38-43`

Character-for-character the same loop (`String.fromCharCode(Math.floor(Math.random() * 26) + 97)`),
differing only in length (`ONLINE_ROOM_CODE_LENGTH` vs `GAME_CODE_LENGTH - 1`, the `-1` making room
for the transport-type prefix added in `getGameCode()`).

**Recommendation.** `generateRoomCode(length: number): string` in `src/modules/utils/`. Have
`NetworkServer` call it with `GAME_CODE_LENGTH - 1` and keep the prefixing where it is.

### 2.4 Room code display + invite-link copy panel duplicated

`src/routes/online/lobby/room-code-panel.tsx` vs `src/routes/connect-remote-mic/connect-remote-mic.tsx`:

- letter-splitting code display: `room-code-panel.tsx:37-43` vs the `RoomCode` component at
  `connect-remote-mic.tsx:10-18` — same `subtle-focus … rounded-md … uppercase` treatment, differing
  only in `gap-3`/`px-3` vs `gap-4`/`px-4`;
- link construction: `room-code-panel.tsx:8-14` vs `connect-remote-mic.tsx:21-29` — same
  `new URL(location.href)` → `pathname = ${import.meta.env.BASE_URL}<route>` → `search = room=<code>`;
- the copy input + button: `room-code-panel.tsx:45-58` vs `connect-remote-mic.tsx:71-85` — **identical
  Tailwind class strings verbatim** (`box-border w-full border-none bg-gray-600 p-3 text-sm text-white`
  and `bg-active typography text-md box-border cursor-pointer border-0 px-5 font-bold active:bg-black`).
  The online version adds the "Copied" confirmation state; the remote-mic one does not.

**Recommendation.** Two components in `src/modules/elements/`: `<RoomCode code />` and
`<CopyLinkField link />` (with the copied-state feedback, which is the better behaviour — adopt it
for the remote-mic screen too), plus `buildRoomLink(route: string, code: string)` in
`src/modules/utils/`. `RoomCodePanel` keeps its lobby-specific layout and composes these.

### 2.5 Player color picker duplicated, and the color-name tables have already diverged

- `src/routes/online/lobby/customize-modal.tsx:18-23` + button list at `:82-107`
- `src/routes/remote-mic/components/player-change-modal.tsx:15-20` + button list at `:34-59`

`colorNames: Record<backgroundTheme, string[]>` exists twice — the remote-mic copy has 4 entries per
theme, the online copy has 6 (Pink/Orange, Violet/Silver, Violet/Orange, Blue/Gold). Since
`styles.ts` now defines 6 player colors for every theme (`drawing/styles.ts:125-153`), the remote-mic
table is simply stale-by-truncation. The button JSX is otherwise the same shape: keyed by number,
`style={{ color: styles.colors.players[number].perfect.fill }}`, occupant name in a
`text-sm text-gray-300` span, `data-focused={isOwn}`.

Note the two even use a different source for "current theme": `useSettingValue(BackgroundThemeSetting)`
online vs `useSubscription('style')` on the remote mic — that difference is real (the phone learns the
theme over the wire) and must be kept as an injected prop, not collapsed.

**Recommendation.** Move the 6-entry `PLAYER_COLOR_NAMES` to
`src/modules/game-engine/drawing/player-colors.ts` (next to the color sets it names), and extract
`<PlayerColorPicker theme playerNumbers selected occupants onPick />` into `src/modules/elements/`.
Remote mic passes `PLAYER_NUMBERS.slice(0, MAX_PLAYERS)` and its subscription-derived theme; online
passes all six.

### 2.6 Two "colored dot for a player" components

- `src/modules/elements/player-color-dot.tsx` (new on this branch) — `styles.colors.players[n].text`,
  fixed `h-3 w-3`
- `src/routes/remote-mic/components/player-number-circle.tsx` — `styles.colors.players[n].perfect.fill`,
  `1em`-relative, handles `null`, force-updates on theme change

Same concept, two different colors for the same player. Anywhere both appear in a session (phone +
TV), the same singer is shown in two shades.

**Recommendation.** Keep one component in `src/modules/elements/player-color-dot.tsx` with a
`variant?: 'text' | 'fill'` prop and `number: PlayerNumber | null`, adopting the `1em` sizing (it
composes better) plus the explicit `className` override the new one already has. Decide which color
field is canonical and say so in the docstring.

### 2.7 Five copy-pasted subscription hooks, bypassing the manager's snapshot support

`src/modules/online/client/hooks.ts:14-46` — five hooks with identical bodies
(`useState` + `useEffect(() => manager.subscribe(channel, setX), [])`), one per channel.

Remote mic solved this once, generically, and better:
`src/modules/remote-mic/network/client/hooks/use-subscription.ts` uses `useSyncExternalStore` over
`ClientSubscriptionManager.getSnapshot`. `getSnapshot` was explicitly kept generic during this
branch's refactor (`rpc/subscription-manager.ts:34-38`) — but online never calls it, so online
re-renders carry an extra state hop and the cached-value path is unused.

**Recommendation.** Add a factory next to the manager:

```ts
export const createSubscriptionHook =
  <TChannels extends AnySubscriptionChannels>(manager: ClientSubscriptionManager<TChannels>) =>
  <C extends keyof TChannels>(channel: C) => { /* useSyncExternalStore */ };
```

`useSubscription` (remote mic) and `useOnlineSubscription` (online) both become one line. The five
named online hooks stay as thin, typed wrappers with their defaults (`[]`, `{}`, `null`) — those are
worth keeping for readability, they just stop containing logic.

### 2.8 Ping/pong latency loop and reconnect loop implemented twice on the client, twice on the server

| Concern | Online | Remote mic |
|---|---|---|
| ping → pong → latency → re-arm after 2 s | `online-client.ts:183-204` | `network-client.ts:200-218` |
| reconnect with a fixed delay | `online-client.ts:152-158` (1.5 s) | `network-client.ts:187-192, 260-266` (1.5 s / 2 s) |
| server replies `pong` to `ping` | `partykit/online-room.ts:119-120` | `network-server.ts:90-91` |

**Recommendation.** A `PingPongTracker` class in `src/modules/remote-mic/network/rpc/` (or, better,
a new neutral `src/modules/network/` — see 2.9) exposing `start(send)`, `handlePong()`,
`getLatency()`, `stop()`. Both clients own an instance. The server-side reply is one line and can
stay duplicated, or move into a shared `handleRpcEnvelope(message, reply)` if 2.9 is done.

### 2.9 Server-side subscription registry duplicated

`partykit/online-room.ts:20-21, 121-136` maintains `subscriptions: Map<channel, Set<connectionId>>`
plus `channelLastValues`, and replays the last value to a new subscriber.
`src/modules/remote-mic/network/server/network-server.ts:33-35, 77-89` does the same thing (with the
subscriber set living in `RemoteMicManager`).

The client half of this was already generalized on this branch (`ClientSubscriptionManager`); the
server half was not.

**Recommendation.** `ServerSubscriptionRegistry<TChannels>` next to `subscription-manager.ts`:
`subscribe(peerId, channel)`, `unsubscribe(peerId, channel)`, `removePeer(peerId)`,
`publish(channel, data, send)`, `getLastValue(channel)`. The online room's extra behaviour —
falling back to `logic.getState()` / `logic.getChartPreview()` when a channel has no cached value
(`online-room.ts:130-134`) — becomes a `fallbacks` option. Consider moving the whole RPC core out of
`src/modules/remote-mic/network/rpc/` to `src/modules/network/rpc/` at the same time: online already
imports six symbols from under `remote-mic/`, which reads as a layering violation
(`online-client.ts:4-5`, `room-logic.ts:2-3`, `types.ts:2`, `online-room.ts:5`).

### 2.10 Client transports overlap (low priority)

`OnlineTransport` (`online-client.ts:37-66`) and `WebSocketClientTransport`
(`remote-mic/network/client/transport/web-socket-client.ts`) share the open/onmessage/onclose
skeleton and the identical `isConnected = () => (this.connection?.readyState ?? Infinity) < 2`.
They differ in encoding (JSON vs `pack`/`unpack`) and in the connect handshake, so a shared base
class buys little. Worth noting only if 2.9 moves the RPC core anyway — then a
`JsonWebSocketTransport` base is cheap.

---

## P2 — Duplication inside the new online code

### 3.1 The coalesced-publish algorithm appears twice in `room-logic.ts`

`src/modules/online/protocol/room-logic.ts:182-202` (leaderboard) and `:205-229` (player stats) are
the same leading+trailing throttle, written out twice with renamed fields
(`leaderboardDirty`/`statsDirty`, `'leaderboard-throttle'`/`'stats-throttle'`).

**Recommendation.**

```ts
private createCoalescedPublisher = (timerName: string, intervalMs: number, publish: () => void) => {
  let dirty = false;
  const startCooldown = () => this.setTimer(timerName, intervalMs, () => { … });
  return () => { … };
};
```

Instantiated twice in the constructor. ~25 lines removed and the throttling semantics are then
defined once.

### 3.2 Phase-reset blocks repeated three times

`enterResults` (`:468-477`), `returnToLobby` (`:498-524`) and the `cancelStart` handler (`:554-566`)
each clear an overlapping subset of
`playbackAnchor`, `pause`, `resumeCountdownEndsAt`, `finishRequestedAt`, `readinessDeadline` and the
`'resume'`/`'buffering'`/`'readiness'`/`'force-results'` timers. The subsets differ, and it is not
obvious from reading whether each difference is intentional.

**Recommendation.** `private resetPlayback = ({ keepReadiness = false } = {}) => …` covering the
fields and timers, called from all three. Where a caller currently omits a reset, make the omission
explicit via an option rather than by absence.

### 3.3 Room state enumerated in four places

Class fields (`room-logic.ts:70-91`), `OnlinePersistedState` (`:31-49`), the persist literal inside
`touch()` (`:154-168`), and `getState()` (`:135-149`). Adding a field means touching all four, and
forgetting the third silently breaks hibernation recovery.

**Recommendation.** Have `touch()` call a single `private snapshot(): OnlinePersistedState`, and
derive `OnlinePersistedState` from that method's return type (`ReturnType<…>`) so the type cannot
drift from the value. `getState()` legitimately differs (it adds transient fields and clones arrays)
— leave it, but add a comment saying which fields are deliberately not persisted.

### 3.4 `.catch(() => undefined)` on every fire-and-forget RPC call

18 occurrences across `src/routes/online/**` and `src/modules/online/**` (9 in
`online-singing.tsx` alone). Every one is `void OnlineClient.rpc.x.y(…).catch(() => undefined)`.

**Recommendation.** Either a tiny `fireAndForget(promise)` helper, or — better — a
`OnlineClient.send.<ns>.<method>(…)` proxy variant that swallows rejections by construction, so the
call sites read as intent rather than boilerplate. Keep `rpc.*` for the handful of calls that do
await a result (`estimateClockOffset`, `getChart`, `checkRoomExists`).

---

## P3 — Half-finished extractions and consistency

### 4.1 `useMicMonitoring` not adopted everywhere

The hook was extracted on this branch (`src/modules/hooks/use-mic-monitoring.ts`) and adopted by
`select-input-view.tsx`, `online-room.tsx:70` and the wizard's `MicStep`
(`setup-wizard.tsx:273`). But
`src/routes/sing-a-song/song-selection/components/song-settings/mic-check.tsx:14-16` still calls
`InputManager.startMonitoring()` directly in a `useEffect` **with no cleanup** — the exact pattern
the hook was written to replace, and it never stops monitoring.

**Recommendation.** Replace with `useMicMonitoring()`. Verify the local song-settings screen still
shows levels (the hook's "don't tear down what you didn't start" rule should make this a no-op
behaviourally, and it fixes the missing stop).

### 4.2 `PLAYER_NUMBERS` exists but local screens still hardcode `[0, 1, 2, 3]`

`PLAYER_NUMBERS` (`src/modules/players/player-number.ts:15`) is all six numbers, which is right for
online. Local screens still inline the tuple:
`mic-check.tsx:35`, `remote-mic/components/player-change-modal.tsx:34`,
`mic-check-slot.stories.tsx:26,56,60,66`.

**Recommendation.** Export `LOCAL_PLAYER_NUMBERS = PLAYER_NUMBERS.slice(0, MAX_PLAYERS)` (or a
`playerNumbers(max)` helper) from `player-number.ts` and use it at those sites. That way raising
`MAX_PLAYERS` for local play later is a one-line change instead of a grep.

### 4.3 Re-export shims create two import paths per constant

- `src/modules/players/players-manager.ts:14` — `export { MAX_PLAYERS }`
- `src/modules/online/protocol/consts.ts:3` — `export { ONLINE_MAX_PLAYERS }`

Both re-export from `player-number.ts`. Consumers now import the same constant from two paths
(`use-player-number-preset.ts:4` and `use-remote-mic-autoselect.ts:6` go through `players-manager`;
`room-logic.ts:1` goes direct).

**Recommendation.** Drop both shims and import from `~/modules/players/player-number` everywhere.
Small, mechanical, and removes the "which one is canonical?" question.

### 4.4 Layout-reserver blocks duplicate the content they reserve for

Two spots use invisible copies of real content to hold a height — the copies must be updated by hand
when the real content changes:

- `src/routes/select-input/variants/built-in.tsx` — the string
  *"Please allow access to the microphone so the default one can be selected."* appears at `:50`
  (inside `StartingUpReserve`) and again at `:147` (the actual `UserMediaEnabled` fallback).
- `src/routes/game/singing/calibration-intro.tsx:18-38` — an invisible reproduction of
  `modules/calibration/calibration.tsx`'s hint lines and its `150px`/`50px` spacers, with a comment
  that says *"Mirrors modules/calibration/calibration.tsx; keep the two in step."*

The second is the more fragile of the two: it hardcodes pixel heights from another file.

**Recommendation.** For `built-in.tsx`, hoist the string to a module const used by both. For the
calibration intro, export the reserver from `calibration.tsx` itself (e.g.
`export const CalibrationLayoutReserve = () => …`, rendering the same nodes with `invisible`), so
one file owns both the visible and the reserved layout.

### 4.5 `built-in.tsx` is now branching on `onlineSetup` in five places

Not duplication, but the counterweight to it: `props.onlineSetup` gates the mic-check boxes, the
switcher's inline level bar, the tip choice, the tip reserver and the "Change Input Type" button
(`built-in.tsx:158, 190, 193, 196, 204`). This is fine at five, and preferable to a forked copy of
the component — flagging it only so a future sixth flag triggers a composition rethink (slots /
children) rather than another boolean.

---

## P3 — Tests

### 5.1 `online-mode.spec.ts` bypasses the page-object layer the rest of the suite uses

`tests/online-mode.spec.ts:29-69` defines local helpers — `completeNameMicAndCalibrationSteps`,
`joinRoomByCode`, `openGuestPage`, `createRoom` — driving raw `getByTestId` calls. Every other spec
goes through `tests/page-objects/*` via `initialise(page, context, browser)` (which the spec does
import, at `:72`, then largely doesn't use).

`openGuestPage` (`:52-58`) also duplicates the secondary-browser-context pattern already in
`tests/steps/open-and-connect-remote-mic.ts:81,96`.

**Recommendation.** Add `tests/page-objects/online-setup-page.ts` and
`tests/page-objects/online-lobby-page.ts`, register them in `initialise.ts`, and move the helpers
there. Extract `newPlayerPage(browser)` into `tests/steps/` and use it from both the online spec and
the remote-mic steps. This matters because online mode is the one flow that will keep growing new
multi-page scenarios — the helpers will otherwise be copied into every new online spec.

---

## Suggested order of work

1. **1.5** (`InGameAudioSettings`) and **1.4** (`loadSongById`) first — both fix real behavioural
   divergence, not just shape.
2. **1.3** (`toSongHoverPreview`) — already-drifted payload, cheap fix.
3. **1.1** (`ParticipantSlot`) — biggest line-count win and stops the lobby/pause-menu drift.
4. **1.6** (`PostGameView` props) — restores the missing tip/credit while removing the shell copy.
5. **2.7** (subscription hook factory), **2.3**, **2.4**, **2.5**, **2.6**, **2.2** — mechanical,
   independent, safe to parallelize.
6. **3.1**, **3.2**, **3.3** — contained to `room-logic.ts`; it has a 584-line unit-test suite
   (`room-logic.test.ts`), so these are low-risk.
7. **2.1** (`useWizardSteps`), **2.8**, **2.9** — larger refactors; consider **2.9** together with
   moving the RPC core out from under `modules/remote-mic/`.
8. **4.x**, **5.1** — cleanup, any time.

Verification for all of the above: `pnpm type-check`, `pnpm test` (targeted), the Playwright
`online-mode` spec plus `remote-mics-*` specs for anything touching 2.x, then `pnpm build`.
