import { useEffect, useState } from 'react';

import InputManager from '~/modules/game-engine/input/input-manager';
import { createSubscriptionHook } from '~/modules/network/rpc/use-subscription-factory';
import OnlineClient, { OnlineConnectionStatus } from '~/modules/online/client/online-client';
import { ONLINE_IDLE_AFTER_MS, ONLINE_STATS_REPORT_MS } from '~/modules/online/protocol/consts';
import {
  LeaderboardEntry,
  OnlineRoomState,
  PlayersStats,
  SongHoverPreview,
  SongVotes,
} from '~/modules/online/protocol/types';
import { PlayerNumber } from '~/modules/players/player-number';

/** Subscribes to one of the room's push channels and returns the latest data, or undefined before
 * the first push. The named hooks below wrap it with the per-channel default. */
export const useOnlineSubscription = createSubscriptionHook(OnlineClient.subscriptions);

// Module-level so the defaults keep the same reference across renders — the hooks used to hold them
// in state, and callers put the returned value in dependency arrays.
const NO_LEADERBOARD: LeaderboardEntry[] = [];
const NO_SONG_VOTES: SongVotes = {};
const NO_PLAYERS_STATS: PlayersStats = {};

/** Live room state pushed by the server on the 'room-state' channel. */
export const useOnlineRoomState = (): OnlineRoomState | undefined => useOnlineSubscription('room-state');

/** Live leaderboard pushed on the 'leaderboard' channel during singing. */
export const useOnlineLeaderboard = (): LeaderboardEntry[] => useOnlineSubscription('leaderboard') ?? NO_LEADERBOARD;

/** What the host currently hovers in the song browser, pushed on the 'song-preview' channel. */
export const useOnlineSongPreview = (): SongHoverPreview | null => useOnlineSubscription('song-preview') ?? null;

/** Per-participant thumbs up/down on the browsed song, pushed on the 'song-votes' channel. */
export const useOnlineSongVotes = (): SongVotes => useOnlineSubscription('song-votes') ?? NO_SONG_VOTES;

/** Live ping/volume per participant, pushed (coalesced) on the 'player-stats' channel. */
export const useOnlinePlayersStats = (): PlayersStats => useOnlineSubscription('player-stats') ?? NO_PLAYERS_STATS;

/** Volume steps smaller than this don't move the bar by a visible amount — used to skip reports
 * that would tell the room nothing (a silent singer reports 0 once and then goes quiet). */
const VOLUME_REPORT_EPSILON = 0.0005;

/** Coarsest granularity the idle window needs: pointermove fires per pixel (and a held key
 * repeats), so only the first event in each of these windows does any work. Nothing downstream can
 * tell the difference — ONLINE_IDLE_AFTER_MS is two orders of magnitude larger. */
const ACTIVITY_THROTTLE_MS = 500;

/** How often a singer whose volume isn't moving still reports, to keep their ping fresh. */
const STATS_KEEPALIVE_MS = 1_500;

/** The mic is sampled far faster than it's reported, and the peak of the samples is what goes out —
 * a single instantaneous reading every ~300ms would alias the loud parts away. */
const VOLUME_SAMPLE_MS = 50;

/**
 * Whether this browser is being used right now: the pointer moved or a key was pressed within
 * ONLINE_IDLE_AFTER_MS, and the tab is visible. Going idle is what lets the room's Durable Object
 * hibernate — the stats and ping loops are the only traffic a lobby generates on its own, and a
 * forgotten tab would otherwise hold the party awake (and billing duration) indefinitely.
 *
 * Deliberately local-only: nothing another singer does counts as activity here, so one person
 * browsing songs doesn't drag everyone else's client back into reporting. They still *receive*
 * every push — going idle only stops what this browser sends.
 *
 * Pass `enabled: false` wherever idling would be wrong (readiness, singing, pause) — nobody moves
 * the pointer while a countdown is running or a song is playing.
 */
export const useIsUserActive = (enabled: boolean): boolean => {
  // Read at render time, not from an effect: a room mounted in a background tab has no
  // `visibilitychange` coming (it is already hidden), and starting out active would have it report
  // for a full ONLINE_IDLE_AFTER_MS before the idle interval noticed.
  const [active, setActive] = useState(() => !document.hidden);

  useEffect(() => {
    if (!enabled) {
      setActive(true);
      return;
    }
    // Same for becoming eligible to idle while already hidden (a song ending on a background tab)
    if (document.hidden) setActive(false);
    // A ref-like local rather than state: input events must not re-render the lobby — only
    // crossing the idle boundary does.
    let lastActivityAt = Date.now();
    const markActive = (now: number) => {
      lastActivityAt = now;
      if (!document.hidden) setActive(true);
    };
    // Leading-edge throttle: the first move after going idle still resumes instantly, and the rest
    // of the burst costs a subtraction. Doubles as the debounce for a repeating held key.
    const bump = () => {
      const now = Date.now();
      if (now - lastActivityAt < ACTIVITY_THROTTLE_MS) return;
      markActive(now);
    };
    // Hiding the tab is immediate — no point waiting out the window for someone who left. Coming
    // back bypasses the throttle: a hide/show inside one throttle window would otherwise leave
    // `active` stuck false, with nothing but a fresh 500ms of stillness to unstick it.
    const onVisibilityChange = () => (document.hidden ? setActive(false) : markActive(Date.now()));

    const options = { passive: true } as const;
    // pointermove covers mouse, pen and touch-drag; touchstart catches taps that never move.
    global.addEventListener('pointermove', bump, options);
    global.addEventListener('touchstart', bump, options);
    global.addEventListener('keydown', bump, options);
    document.addEventListener('visibilitychange', onVisibilityChange);
    const interval = setInterval(() => {
      if (Date.now() - lastActivityAt >= ONLINE_IDLE_AFTER_MS) setActive(false);
    }, 1_000);

    return () => {
      global.removeEventListener('pointermove', bump);
      global.removeEventListener('touchstart', bump);
      global.removeEventListener('keydown', bump);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      clearInterval(interval);
    };
  }, [enabled]);

  return enabled ? active : true;
};

/** Periodically reports this singer's ping and mic volume to the room, at the same rate the room
 * re-broadcasts them, so everyone else's volume bar moves like a meter instead of a slideshow.
 * While `active` is false nothing is sent (and the mic isn't even sampled) — see `useIsUserActive`. */
export const useReportPlayerStats = (enabled: boolean, active: boolean, playerNumber: PlayerNumber) => {
  useEffect(() => {
    if (!enabled) return;
    OnlineClient.setReportingIdle(!active);
    if (!active) {
      // One last report, so everyone else's row can show them as away instead of as a silent singer
      // with a suspiciously steady ping. Sent straight rather than through the loop below, whose
      // epsilon/keepalive skips would swallow it for anyone who was already quiet.
      OnlineClient.send.room.reportStats(OnlineClient.getLatency(), 0, true);
      return;
    }
    let peakVolume = 0;
    let lastSentVolume: number | null = null;
    let windowStartedAt = 0;
    let lastSentAt = 0;
    const interval = setInterval(() => {
      peakVolume = Math.max(peakVolume, InputManager.getPlayerVolume(playerNumber) ?? 0);

      const now = Date.now();
      if (now - windowStartedAt < ONLINE_STATS_REPORT_MS) return;
      const volume = peakVolume;
      windowStartedAt = now;
      peakVolume = 0;

      // Reporting three times a second is only cheap while it stays quiet when the volume doesn't
      // move — a singer sitting silent then costs one message per keepalive, which is also what
      // refreshes their ping (that one never settles, so it can't gate the skip itself).
      const volumeMoved = lastSentVolume === null || Math.abs(volume - lastSentVolume) >= VOLUME_REPORT_EPSILON;
      if (!volumeMoved && now - lastSentAt < STATS_KEEPALIVE_MS) return;

      lastSentVolume = volume;
      lastSentAt = now;
      // `idle` defaults to false on the wire, so the first report after coming back clears it.
      OnlineClient.send.room.reportStats(OnlineClient.getLatency(), volume);
    }, VOLUME_SAMPLE_MS);
    return () => clearInterval(interval);
  }, [enabled, active, playerNumber]);
};

export const useOnlineConnectionStatus = (): [OnlineConnectionStatus, string | undefined] => {
  const [status, setStatus] = useState<[OnlineConnectionStatus, string | undefined]>([
    OnlineClient.getStatus(),
    undefined,
  ]);
  useEffect(() => {
    // The status may have changed between the initial render and this effect running (e.g. React
    // StrictMode's double-render, or a slow-mounting subtree), so re-sync before subscribing.
    setStatus((current) => {
      const latest = OnlineClient.getStatus();
      return current[0] === latest ? current : [latest, undefined];
    });
    return OnlineClient.addListener((newStatus, detail) => {
      setStatus([newStatus, detail]);
    });
  }, []);
  return status;
};

/** The participant entry of this browser, if connected. */
export const useOnlineSelf = () => {
  const roomState = useOnlineRoomState();
  return roomState?.participants.find((participant) => participant.id === OnlineClient.getParticipantId());
};

export const useIsOnlineHost = () => {
  const roomState = useOnlineRoomState();
  return roomState !== undefined && roomState.hostId === OnlineClient.getParticipantId();
};
