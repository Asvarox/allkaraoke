# Agent prompt — execute the online-mode duplication refactors

Copy everything below the line into the executing agent.

---

You are refactoring the `online-mode` branch of this repo (`/Users/olek/karaoke-test`) to remove
code duplication, primarily between **local game mode** and **online game mode**.

## Source of truth

Read `docs/plans/2026-08-08-online-mode-duplication-report.md` in full before doing anything. It
contains 20 numbered findings (1.1–5.1), each with file:line references and a concrete extraction
proposal. That document is the spec. Do not re-derive the analysis — it has already been done
against `git diff master...HEAD`.

Also read `docs/plans/2026-07-05-online-mode.md` for the design intent behind online mode.

## Hard constraints

1. **No behaviour changes to local party mode.** Online mode is the newcomer; the local game path is
   the incumbent and must render and behave identically after every refactor. Where a finding notes
   that online currently diverges from local (1.4, 1.5, 1.6), converge **online onto local**, not the
   other way round.
2. **Do not undo the extractions this branch already got right**: `MicCheckSlotShell`,
   `useMicSwitcher`, `useMicMonitoring`, the `PlayerNumber`/`MAX_PLAYERS`/`PLAYER_NUMBERS`
   centralization, the RPC-core generalization (`RpcSenderInterface`, `RpcClientTransport`,
   `AnySubscriptionChannels`, generic `ClientSubscriptionManager`), `WizardChecklist` in `akui`, and
   the `cameraEnabled` / `skipIntroEnabled` / `onSkipIntro` props on the local singing components.
   Several findings are about *finishing* these, not replacing them.
3. **Preserve every `data-test` attribute and its value.** The Playwright suite selects on them.
   If a refactor genuinely requires renaming one, update `tests/` in the same change and say so.
4. **Keep the deliberate asymmetries** the report calls out — e.g. in finding 2.5, the remote mic
   reads the theme from `useSubscription('style')` while online reads
   `useSettingValue(BackgroundThemeSetting)`; that must stay an injected prop, not be collapsed.
5. Match surrounding code style: comment density, naming, `~/` import aliases, Tailwind conventions.
   This codebase writes substantive "why" comments — keep the existing ones when moving code, and
   don't strip the explanatory comments that justify non-obvious layout or ordering.
6. No new dependencies.

## How to parallelize

The waves below are grouped so that **no two agents in the same wave touch the same file**. Spawn
one subagent per group, in parallel, within a wave. Wait for the whole wave to finish and verify
before starting the next — later waves depend on earlier ones landing.

Give each subagent: the report path, its finding numbers, its exact file ownership list, the hard
constraints above, and the verification commands. Tell it that it owns those files exclusively and
must not edit files outside its list — if it believes it needs to, it should stop and report back
rather than reach across.

Do not run these in git worktrees; the file ownership split already prevents collisions, and
worktrees would force a merge step per group.

### Wave 1 — five parallel groups

**Group A — online singer rows & pause overlay** (findings 1.1, 1.2, 1.5, 2.6)
Owns: `src/routes/online/lobby/participant-list.tsx`,
`src/routes/online/lobby/song-players-panel.tsx`,
`src/routes/online/singing/pause-overlay.tsx`,
`src/routes/online/singing/readiness-overlay.tsx`,
`src/routes/online/singing/leaderboard-overlay.tsx`,
`src/routes/online/components/participant-badges.tsx`,
`src/modules/elements/player-color-dot.tsx`,
`src/routes/remote-mic/components/player-number-circle.tsx`,
`src/routes/game/singing/game-overlay/components/pause-menu.tsx`,
plus new files under `src/routes/online/components/` and `src/routes/settings/`.
This is the largest group. Order the work: extract `ParticipantSlot` first (1.1), then the shared
`formatScore` (1.2), then `InGameAudioSettings` (1.5), then consolidate the color dot (2.6).
Note 1.5 is a **correctness fix**: the online pause overlay registers `InputLag` inline, which the
comment at `pause-menu.tsx:22-30` explains breaks keyboard-nav ordering. The extracted component
must register from its own render.

**Group B — song transfer & loading** (findings 1.3, 1.4)
Owns: `src/modules/online/client/song-transfer.ts`, `src/routes/online/lobby/lobby.tsx`,
`src/modules/songs/hooks/use-song.ts`, plus new files under `src/modules/songs/` and
`src/modules/online/client/`.
1.4 changes what metadata a transferred song carries — state explicitly in your report whether you
made the online path stamp `isUnverifiedSong`/`sourceType`/`sharedSongId` like `useSong` does, and
what that means for the pause menu's forced-rating flow.

**Group C — results screen** (finding 1.6)
Owns: `src/routes/game/singing/post-game/post-game-view.tsx`,
`src/routes/online/results/online-results.tsx`, `src/stories/post-game.stories.tsx`.
The `GameTip` and the FesliyanStudios attribution must appear on the online results screen when
you're done.

**Group D — room logic internals** (findings 3.1, 3.2, 3.3)
Owns: `src/modules/online/protocol/room-logic.ts` only (`room-logic.test.ts` is read-only for you —
it is your safety net; if a test needs changing, that is a signal you changed behaviour, so stop and
report).
For 3.2, where the three reset sites currently clear *different* subsets of state, make each
difference an explicit option on the shared helper rather than silently unifying them.

**Group E — subscription hooks** (finding 2.7)
Owns: `src/modules/online/client/hooks.ts`,
`src/modules/remote-mic/network/rpc/subscription-manager.ts`,
`src/modules/remote-mic/network/client/hooks/use-subscription.ts`.
Keep the five named online hooks as typed wrappers with their defaults (`[]`, `{}`, `null`) — only
the bodies collapse into the factory.

### Wave 2 — four parallel groups

**Group F — room code & invite link** (findings 2.3, 2.4)
Owns: `src/routes/online/lobby/room-code-panel.tsx`,
`src/routes/connect-remote-mic/connect-remote-mic.tsx`,
`src/routes/online/setup-wizard.tsx`,
`src/modules/remote-mic/network/server/network-server.ts`,
plus new files in `src/modules/elements/` and `src/modules/utils/`.
Adopt the online version's "Copied" confirmation for the remote-mic screen too. Keep the `-1` in
`GAME_CODE_LENGTH - 1` where it is (it makes room for the transport-type prefix in `getGameCode()`)
and comment why.

**Group G — player colors & player-number iteration** (findings 2.5, 4.1, 4.2)
Owns: `src/routes/online/lobby/customize-modal.tsx`,
`src/routes/remote-mic/components/player-change-modal.tsx`,
`src/modules/players/player-number.ts`,
`src/routes/sing-a-song/song-selection/components/song-settings/mic-check.tsx`,
`src/routes/sing-a-song/song-selection/components/song-settings/mic-check/mic-check-slot.stories.tsx`,
plus a new file under `src/modules/game-engine/drawing/` and/or `src/modules/elements/`.
The remote-mic `colorNames` table is stale at 4 entries per theme while `styles.ts` now defines 6 —
the shared table is the 6-entry one, and the remote mic renders a slice of it.

**Group H — layout reservers** (finding 4.4)
Owns: `src/routes/select-input/variants/built-in.tsx`,
`src/routes/game/singing/calibration-intro.tsx`, `src/modules/calibration/calibration.tsx`.
The calibration-intro reserver hardcodes `150px`/`50px` spacers copied from `calibration.tsx` —
make `calibration.tsx` own and export the reserved layout so those numbers live in one file.

**Group I — e2e page objects** (finding 5.1)
Owns: `tests/online-mode.spec.ts`, `tests/page-objects/initialise.ts`, new files under
`tests/page-objects/` and `tests/steps/`.
Read-only on the rest of `tests/`. The spec must still pass unchanged in behaviour.

### Wave 3 — network layer (single agent, no parallelism)

**Group J** (findings 2.8, 2.9, and the module move noted under 2.9)
Owns: `src/modules/remote-mic/network/**`, `src/modules/online/client/online-client.ts`,
`partykit/online-room.ts`, and every import site touched by moving the RPC core out from under
`modules/remote-mic/` to a neutral `src/modules/network/rpc/`.
This is the widest blast radius in the plan — do it alone, after everything else has landed, and
decide the module move as a separate commit from the `PingPongTracker` /
`ServerSubscriptionRegistry` extractions so it can be reverted independently.

### Wave 4 — sequential cleanup (single agent)

**Group K** (findings 4.3, then 3.4)
- 4.3: delete the `MAX_PLAYERS` re-export at `players-manager.ts:14` and the `ONLINE_MAX_PLAYERS`
  re-export at `online/protocol/consts.ts:3`, repointing all importers at
  `~/modules/players/player-number`.
- 3.4: the fire-and-forget RPC helper. **This must be last** — it touches 18 call sites spread
  across every file the earlier waves rewrote.

### Deliberately not in scope

Finding 2.1 (`useWizardSteps`) and 2.10 (transport base class) are listed in the report but are
**deferred**. 2.1 sits across the remote-mic connection wizard, which has its own View-Transitions
machinery and a much larger e2e surface; propose it separately once waves 1–4 are green. 2.2
(`usePersistedDisplayName`) is also deferred — it touches files owned by Groups F and G and is only
worth doing after those settle. Finding 4.5 is informational only; no action.

## Verification

After **each wave** (not each group), run:

```bash
pnpm type-check && pnpm lint && pnpm test --run
```

Then the e2e specs relevant to what the wave touched:

```bash
pnpm e2e tests/online-mode.spec.ts
```

Waves touching remote-mic or shared components (2, 3, 4) additionally need:

```bash
pnpm e2e tests/remote-mics-sing-a-song.spec.ts tests/sing-a-song.spec.ts tests/initial-setup.spec.ts
```

Before declaring done:

```bash
pnpm build
```

If a wave leaves anything red, fix it before starting the next wave — do not stack refactors on a
broken tree.

## Commits

One commit per group, message naming the finding numbers, e.g.
`refactor(online): extract ParticipantSlot, shared score formatting and in-game audio settings (1.1, 1.2, 1.5, 2.6)`.
Do not squash across groups — each should be independently revertable. Do not push.

## Reporting

After each wave, report: which findings landed, what changed behaviourally (there should be very
little, and each instance must be named), which verification commands passed, and anything a
subagent flagged as needing a decision. If a subagent concludes a proposed extraction is wrong —
that the two code paths are legitimately different and unifying them would couple unrelated things —
say so and skip it rather than forcing it. That verdict is a valid outcome; record the reasoning.
