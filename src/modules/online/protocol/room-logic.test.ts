import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { RpcContext } from '~/modules/network/rpc/types';
import {
  ChartValidationError,
  compressChart,
  prepareChartTransfer,
  unpackChartTransfer,
} from '~/modules/online/protocol/chart-transfer';
import {
  ONLINE_BUFFERING_PAUSE_MS,
  ONLINE_FORCE_RESULTS_MS,
  ONLINE_LEADERBOARD_PUBLISH_MS,
  ONLINE_READINESS_TIMEOUT_MS,
  ONLINE_RECONNECT_GRACE_MS,
  ONLINE_RESUME_COUNTDOWN_MS,
  ONLINE_ROOM_TTL_MS,
  ONLINE_START_LEAD_MS,
  ONLINE_STATS_PUBLISH_MS,
} from '~/modules/online/protocol/consts';
import { OnlinePersistedState, OnlineRoomLogic } from '~/modules/online/protocol/room-logic';
import { WireDetailedScore } from '~/modules/online/protocol/types';
import { ONLINE_MAX_PLAYERS } from '~/modules/players/player-number';

const ctx = (senderId: string): RpcContext => ({ senderId, permission: 'write', removePlayer: () => undefined });

const CHART_TXT = '#ARTIST:Some Artist\n#TITLE:Some Song\n: 0 4 59 Test\nE';
let manifest: Awaited<ReturnType<typeof prepareChartTransfer>>['manifest'];
let chartData: string;

const SAMPLE_DETAILED_SCORE: WireDetailedScore = [{ normal: 100 }, { normal: 200 }];

// Compress once with real timers, before the fake-timer hooks kick in
beforeAll(async () => {
  ({ manifest, data: chartData } = await prepareChartTransfer(
    { songId: 'song-1', artist: 'Some Artist', title: 'Some Song', video: 'video1' },
    CHART_TXT,
  ));
});

const createRoom = (restoreFrom?: OnlinePersistedState, liveParticipantIds?: ReadonlySet<string>) => {
  const published: Record<string, unknown[]> = {};
  const persist = vi.fn();
  const scheduleWake = vi.fn();
  const destroy = vi.fn();
  const disconnect = vi.fn();
  // Stands in for the room's single Durable Object alarm: re-armed on every scheduleWake and, when
  // it comes due on the fake clock, calls back into handleAlarm exactly as PartyKit's onAlarm does.
  let alarm: ReturnType<typeof setTimeout> | null = null;
  // Filled in right below; the alarm callback only ever runs after construction has finished.
  const armed: { logic?: OnlineRoomLogic } = {};
  const logic = new OnlineRoomLogic(
    {
      roomCode: 'testr',
      now: () => Date.now(),
      publish: (channel, data) => {
        (published[channel] ??= []).push(data);
      },
      persist,
      scheduleWake: (deadline) => {
        scheduleWake(deadline);
        if (alarm !== null) clearTimeout(alarm);
        alarm = null;
        if (deadline === null) return;
        alarm = setTimeout(
          () => {
            alarm = null;
            armed.logic?.handleAlarm();
          },
          Math.max(0, deadline - Date.now()),
        );
      },
      destroy,
      disconnect,
    },
    restoreFrom,
    liveParticipantIds,
  );
  armed.logic = logic;
  const handlers = logic.createHandlers();
  return { logic, handlers, published, persist, scheduleWake, destroy, disconnect };
};

type Room = ReturnType<typeof createRoom>;

const join = (room: Room, ids: string[]) => {
  ids.forEach((id) => {
    expect(room.logic.handleConnect(id, `Name ${id}`, { create: true })).toEqual({ accepted: true });
  });
};

const uploadChart = async (room: Room, hostId = 'p1') => {
  await room.handlers.selection.setChart.handler(ctx(hostId), manifest, chartData, 2);
};

const confirmAll = async (room: Room, ids: string[]) => {
  for (const id of ids) {
    await room.handlers.room.setReady.handler(ctx(id), true);
  }
};

const startSinging = async (room: Room, ids: string[], hostId = 'p1') => {
  await uploadChart(room, hostId);
  await room.handlers.room.startGame.handler(ctx(hostId));
  expect(room.logic.getState().phase).toBe('readiness');
  await confirmAll(room, ids);
  expect(room.logic.getState().phase).toBe('singing');
  // The anchor is set a beat ahead of the start so every client hits play at the same instant
  vi.advanceTimersByTime(ONLINE_START_LEAD_MS);
};

beforeEach(() => {
  vi.useFakeTimers();
});
afterEach(() => {
  vi.useRealTimers();
});

describe('participants', () => {
  it('accepts up to 6 participants and rejects the 7th', () => {
    const room = createRoom();
    join(room, ['p1', 'p2', 'p3', 'p4', 'p5', 'p6']);
    expect(room.logic.handleConnect('p7', 'Name p7')).toEqual({ accepted: false, reason: 'room-full' });
    expect(room.logic.getState().participants).toHaveLength(ONLINE_MAX_PLAYERS);
  });

  it('assigns distinct player numbers by join order', () => {
    const room = createRoom();
    join(room, ['p1', 'p2', 'p3']);
    expect(room.logic.getState().participants.map((participant) => participant.playerNumber)).toEqual([0, 1, 2]);
  });

  it('elects the first joiner as host', () => {
    const room = createRoom();
    join(room, ['p1', 'p2']);
    expect(room.logic.getState().hostId).toBe('p1');
  });

  it('rejects joining a room that was never opened, until someone creates it', () => {
    const room = createRoom();
    expect(room.logic.handleConnect('p1', 'Name p1')).toEqual({ accepted: false, reason: 'not-found' });
    expect(room.logic.isCreated()).toBe(false);

    expect(room.logic.handleConnect('p1', 'Name p1', { create: true })).toEqual({ accepted: true });
    expect(room.logic.isCreated()).toBe(true);
    // once created, plain joins work
    expect(room.logic.handleConnect('p2', 'Name p2')).toEqual({ accepted: true });
  });

  it('coalesces player-stats (ping/volume) broadcasts', async () => {
    const room = createRoom();
    join(room, ['p1', 'p2']);

    await room.handlers.room.reportStats.handler(ctx('p1'), 42, 0.01);
    await room.handlers.room.reportStats.handler(ctx('p2'), 99, 0.02);
    // leading publish only, the second report waits for the cooldown
    expect(room.published['player-stats']).toHaveLength(1);

    vi.advanceTimersByTime(ONLINE_STATS_PUBLISH_MS);
    expect(room.published['player-stats']).toHaveLength(2);
    expect(room.published['player-stats'].at(-1)).toEqual({
      p1: { ping: 42, volume: 0.01, idle: false },
      p2: { ping: 99, volume: 0.02, idle: false },
    });
  });

  it('marks a singer idle when they stop reporting, and clears it the moment they come back', async () => {
    const room = createRoom();
    join(room, ['p1']);

    await room.handlers.room.reportStats.handler(ctx('p1'), 42, 0.01);
    vi.advanceTimersByTime(ONLINE_STATS_PUBLISH_MS);

    // Going idle is stated, not inferred — the room has no timer watching for stale entries
    await room.handlers.room.reportStats.handler(ctx('p1'), 42, 0, true);
    vi.advanceTimersByTime(ONLINE_STATS_PUBLISH_MS);
    expect(room.published['player-stats'].at(-1)).toEqual({ p1: { ping: 42, volume: 0, idle: true } });

    await room.handlers.room.reportStats.handler(ctx('p1'), 40, 0.02);
    vi.advanceTimersByTime(ONLINE_STATS_PUBLISH_MS);
    expect(room.published['player-stats'].at(-1)).toEqual({ p1: { ping: 40, volume: 0.02, idle: false } });
  });

  it('trims and bounds a set name, falling back to the current name when empty', async () => {
    const room = createRoom();
    join(room, ['p1']);

    await room.handlers.room.setName.handler(ctx('p1'), `  ${'x'.repeat(50)}  `);
    expect(room.logic.getState().participants.find((p) => p.id === 'p1')?.name).toBe('x'.repeat(20));

    await room.handlers.room.setName.handler(ctx('p1'), '   ');
    expect(room.logic.getState().participants.find((p) => p.id === 'p1')?.name).toBe('x'.repeat(20));
  });

  it('lets a singer change color to a free player number, but not to a taken one', async () => {
    const room = createRoom();
    join(room, ['p1', 'p2']);

    await room.handlers.room.setPlayerNumber.handler(ctx('p2'), 4);
    expect(room.logic.getState().participants.find((p) => p.id === 'p2')?.playerNumber).toBe(4);

    expect(() => room.handlers.room.setPlayerNumber.handler(ctx('p2'), 0)).toThrow('taken');
    // the freed color is available for a new joiner
    join(room, ['p3']);
    expect(room.logic.getState().participants.find((p) => p.id === 'p3')?.playerNumber).toBe(1);
  });

  it('keeps the host and join order when the host refreshes within the grace period', () => {
    const room = createRoom();
    join(room, ['p1', 'p2']);
    room.logic.handleDisconnect('p1');
    expect(room.logic.getState().hostId).toBe('p1');

    vi.advanceTimersByTime(ONLINE_RECONNECT_GRACE_MS / 2);
    room.logic.handleConnect('p1', 'Name p1');
    vi.advanceTimersByTime(ONLINE_RECONNECT_GRACE_MS);

    const state = room.logic.getState();
    expect(state.hostId).toBe('p1');
    expect(state.participants.map((participant) => participant.id)).toEqual(['p1', 'p2']);
  });

  it('removes a disconnected participant after the grace period and promotes the next-joined host', () => {
    const room = createRoom();
    join(room, ['p1', 'p2', 'p3']);
    room.logic.handleDisconnect('p1');
    vi.advanceTimersByTime(ONLINE_RECONNECT_GRACE_MS);

    const state = room.logic.getState();
    expect(state.participants.map((participant) => participant.id)).toEqual(['p2', 'p3']);
    expect(state.hostId).toBe('p2');
  });

  it('frees the spot after grace expiry so a new singer can join', () => {
    const room = createRoom();
    join(room, ['p1', 'p2', 'p3', 'p4', 'p5', 'p6']);
    room.logic.handleDisconnect('p6');
    vi.advanceTimersByTime(ONLINE_RECONNECT_GRACE_MS);
    expect(room.logic.handleConnect('p7', 'Name p7')).toEqual({ accepted: true });
  });
});

describe('song selection / chart transfer', () => {
  it('stores the chart and lets any participant download it (late join)', async () => {
    const room = createRoom();
    join(room, ['p1', 'p2']);
    await uploadChart(room);

    const state = room.logic.getState();
    expect(state.chart?.songId).toBe('song-1');

    join(room, ['p3']); // late joiner
    const downloaded = await room.handlers.selection.getChart.handler(ctx('p3'));
    expect(await unpackChartTransfer(state.chart!, downloaded)).toEqual(CHART_TXT);
  });

  it('rejects chart uploads from non-hosts', async () => {
    const room = createRoom();
    join(room, ['p1', 'p2']);
    await expect(room.handlers.selection.setChart.handler(ctx('p2'), manifest, chartData, 2)).rejects.toThrow(
      'Only the host',
    );
  });

  it('rejects a corrupted upload via hash validation', async () => {
    const room = createRoom();
    join(room, ['p1']);
    const corrupted = await compressChart('some other content entirely');
    await expect(room.handlers.selection.setChart.handler(ctx('p1'), manifest, corrupted, 2)).rejects.toThrow(
      ChartValidationError,
    );
    expect(room.logic.getState().chart).toBeNull();
  });

  it('rejects out-of-range or non-integer tolerance values', async () => {
    const room = createRoom();
    join(room, ['p1']);
    await expect(room.handlers.selection.setChart.handler(ctx('p1'), manifest, chartData, 0)).rejects.toThrow(
      'Invalid tolerance',
    );
    await expect(room.handlers.selection.setChart.handler(ctx('p1'), manifest, chartData, 1.5)).rejects.toThrow(
      'Invalid tolerance',
    );
    expect(room.logic.getState().chart).toBeNull();
  });

  it('broadcasts the host song-browser hover on a side channel, host-only', async () => {
    const room = createRoom();
    join(room, ['p1', 'p2']);

    const preview = { songId: 'song-1', artist: 'Some Artist', title: 'Some Song' };
    await room.handlers.selection.setPreview.handler(ctx('p1'), preview);
    expect(room.published['song-preview'].at(-1)).toEqual(preview);

    await room.handlers.selection.setPreview.handler(ctx('p1'), null);
    expect(room.published['song-preview'].at(-1)).toBeNull();

    expect(() => room.handlers.selection.setPreview.handler(ctx('p2'), preview)).toThrow('Only the host');
  });
});

describe('starting a song and readiness', () => {
  it('lets the host start on their own and holds playback until everyone confirms', async () => {
    const room = createRoom();
    join(room, ['p1', 'p2']);
    await uploadChart(room);

    await room.handlers.room.startGame.handler(ctx('p1'));
    const waiting = room.logic.getState();
    expect(waiting.phase).toBe('readiness');
    expect(waiting.readinessDeadline).toBe(Date.now() + ONLINE_READINESS_TIMEOUT_MS);
    expect(waiting.playbackAnchor).toBeNull();
    expect(waiting.participants.every((participant) => !participant.ready)).toBe(true);

    await room.handlers.room.setReady.handler(ctx('p1'), true);
    expect(room.logic.getState().phase).toBe('readiness');

    await room.handlers.room.setReady.handler(ctx('p2'), true);
    const singing = room.logic.getState();
    expect(singing.phase).toBe('singing');
    expect(singing.readinessDeadline).toBeNull();
    expect(singing.playbackAnchor).toEqual({ serverTimeMs: Date.now() + ONLINE_START_LEAD_MS, videoTimeMs: 0 });
  });

  it('only lets the host start, and only with a song selected', async () => {
    const room = createRoom();
    join(room, ['p1', 'p2']);
    expect(() => room.handlers.room.startGame.handler(ctx('p1'))).toThrow('No song selected');

    await uploadChart(room);
    expect(() => room.handlers.room.startGame.handler(ctx('p2'))).toThrow('Only the host');
  });

  it('refuses to start for a lone singer and points them at local mode', async () => {
    const room = createRoom();
    join(room, ['p1']);
    await uploadChart(room);

    expect(() => room.handlers.room.startGame.handler(ctx('p1'))).toThrow('at least 2 singers');
    expect(room.logic.getState().phase).toBe('lobby');

    join(room, ['p2']);
    await room.handlers.room.startGame.handler(ctx('p1'));
    expect(room.logic.getState().phase).toBe('readiness');
  });

  it('counts only connected singers towards the minimum', async () => {
    const room = createRoom();
    join(room, ['p1', 'p2']);
    await uploadChart(room);
    room.logic.handleDisconnect('p2');

    expect(() => room.handlers.room.startGame.handler(ctx('p1'))).toThrow('at least 2 singers');
  });

  it('starts the song anyway when the autostart deadline passes', async () => {
    const room = createRoom();
    join(room, ['p1', 'p2']);
    await uploadChart(room);
    await room.handlers.room.startGame.handler(ctx('p1'));
    await room.handlers.room.setReady.handler(ctx('p1'), true);

    vi.advanceTimersByTime(ONLINE_READINESS_TIMEOUT_MS);
    const state = room.logic.getState();
    expect(state.phase).toBe('singing');
    // p2 never confirmed — the song rolls for everyone regardless
    expect(state.participants.find((participant) => participant.id === 'p2')?.ready).toBe(false);
  });

  it('starts once the last singer still being waited for drops out', async () => {
    const room = createRoom();
    join(room, ['p1', 'p2']);
    await uploadChart(room);
    await room.handlers.room.startGame.handler(ctx('p1'));
    await room.handlers.room.setReady.handler(ctx('p1'), true);

    room.logic.handleDisconnect('p2');
    vi.advanceTimersByTime(ONLINE_RECONNECT_GRACE_MS);
    expect(room.logic.getState().phase).toBe('singing');
  });

  it('lets the host call the start off and go back to the lobby', async () => {
    const room = createRoom();
    join(room, ['p1', 'p2']);
    await uploadChart(room);
    await room.handlers.room.startGame.handler(ctx('p1'));
    await room.handlers.room.setReady.handler(ctx('p2'), true);

    expect(() => room.handlers.room.cancelStart.handler(ctx('p2'))).toThrow('Only the host');
    await room.handlers.room.cancelStart.handler(ctx('p1'));

    const state = room.logic.getState();
    expect(state.phase).toBe('lobby');
    expect(state.readinessDeadline).toBeNull();
    expect(state.participants.every((participant) => !participant.ready)).toBe(true);
    // The song stays selected — calling the start off isn't picking a different one
    expect(state.chart).not.toBeNull();

    // …and the autostart that was pending must not fire after the cancel
    vi.advanceTimersByTime(ONLINE_READINESS_TIMEOUT_MS);
    expect(room.logic.getState().phase).toBe('lobby');
  });

  it('refuses readiness confirmations outside the readiness phase', async () => {
    const room = createRoom();
    join(room, ['p1']);
    await uploadChart(room);
    expect(() => room.handlers.room.setReady.handler(ctx('p1'), true)).toThrow('Nothing to confirm readiness for');
  });
});

describe('pause policy', () => {
  it('lets any singer pause and any singer resume, with a resume countdown', async () => {
    const room = createRoom();
    join(room, ['p1', 'p2', 'p3']);
    await startSinging(room, ['p1', 'p2', 'p3']);

    vi.advanceTimersByTime(10_000);
    await room.handlers.playback.pause.handler(ctx('p3')); // non-host pauses
    const paused = room.logic.getState();
    expect(paused.pause).toMatchObject({ participantId: 'p3', reason: 'manual', videoTimeMs: 10_000 });
    expect(paused.playbackAnchor).toBeNull();

    await room.handlers.playback.resume.handler(ctx('p2')); // another singer resumes
    expect(room.logic.getState().resumeCountdownEndsAt).toBe(Date.now() + ONLINE_RESUME_COUNTDOWN_MS);

    vi.advanceTimersByTime(ONLINE_RESUME_COUNTDOWN_MS);
    const resumed = room.logic.getState();
    expect(resumed.pause).toBeNull();
    expect(resumed.playbackAnchor).toEqual({ serverTimeMs: Date.now(), videoTimeMs: 10_000 });
  });

  it('auto-pauses when a singer buffers longer than the threshold and auto-resumes when recovered', async () => {
    const room = createRoom();
    join(room, ['p1', 'p2']);
    await startSinging(room, ['p1', 'p2']);

    await room.handlers.playback.reportStatus.handler(ctx('p2'), 'buffering');
    expect(room.logic.getState().pause).toBeNull(); // not yet — threshold not reached

    vi.advanceTimersByTime(ONLINE_BUFFERING_PAUSE_MS);
    expect(room.logic.getState().pause).toMatchObject({ participantId: 'p2', reason: 'buffering' });

    await room.handlers.playback.reportStatus.handler(ctx('p2'), 'paused');
    expect(room.logic.getState().resumeCountdownEndsAt).not.toBeNull();

    vi.advanceTimersByTime(ONLINE_RESUME_COUNTDOWN_MS);
    expect(room.logic.getState().pause).toBeNull();
  });

  it('does not auto-pause when the singer recovers before the threshold', async () => {
    const room = createRoom();
    join(room, ['p1', 'p2']);
    await startSinging(room, ['p1', 'p2']);

    await room.handlers.playback.reportStatus.handler(ctx('p2'), 'buffering');
    vi.advanceTimersByTime(ONLINE_BUFFERING_PAUSE_MS / 2);
    await room.handlers.playback.reportStatus.handler(ctx('p2'), 'playing');
    vi.advanceTimersByTime(ONLINE_BUFFERING_PAUSE_MS);
    expect(room.logic.getState().pause).toBeNull();
  });
});

describe('kick & ban', () => {
  it('lets the host kick a singer, who is removed, disconnected and cannot rejoin', async () => {
    const room = createRoom();
    join(room, ['p1', 'p2', 'p3']);

    await room.handlers.room.kickPlayer.handler(ctx('p1'), 'p2');

    const state = room.logic.getState();
    expect(state.participants.map((p) => p.id)).toEqual(['p1', 'p3']);
    expect(room.disconnect).toHaveBeenCalledWith('p2');
    expect(room.logic.handleConnect('p2', 'Name p2')).toEqual({ accepted: false, reason: 'banned' });
    // the ban survives restarts
    expect(room.persist.mock.calls.at(-1)?.[0].bannedIds).toEqual(['p2']);
  });

  it('rejects kicks from non-hosts and self-kicks', async () => {
    const room = createRoom();
    join(room, ['p1', 'p2']);
    expect(() => room.handlers.room.kickPlayer.handler(ctx('p2'), 'p1')).toThrow('Only the host');
    expect(() => room.handlers.room.kickPlayer.handler(ctx('p1'), 'p1')).toThrow('yourself');
  });
});

describe('host ends the game', () => {
  it('asks everyone to wrap up and shows the results once all finals arrive', async () => {
    const room = createRoom();
    join(room, ['p1', 'p2']);
    await startSinging(room, ['p1', 'p2']);

    await room.handlers.room.endGame.handler(ctx('p1'));
    expect(room.logic.getState().finishRequestedAt).toBe(Date.now());
    expect(room.logic.getState().phase).toBe('singing');

    await room.handlers.scoring.publishFinal.handler(ctx('p1'), SAMPLE_DETAILED_SCORE);
    await room.handlers.scoring.publishFinal.handler(ctx('p2'), SAMPLE_DETAILED_SCORE);

    const state = room.logic.getState();
    expect(state.phase).toBe('results');
    expect(state.finishRequestedAt).toBeNull();
  });

  it('forces the results with leaderboard-derived scores when singers do not respond', async () => {
    const room = createRoom();
    join(room, ['p1', 'p2']);
    await startSinging(room, ['p1', 'p2']);
    await room.handlers.scoring.publishScore.handler(ctx('p2'), 1_234);

    await room.handlers.room.endGame.handler(ctx('p1'));
    vi.advanceTimersByTime(ONLINE_FORCE_RESULTS_MS);

    const state = room.logic.getState();
    expect(state.phase).toBe('results');
    expect(state.finalResults).toHaveLength(2);
    const p2Result = state.finalResults!.find((result) => result.participantId === 'p2');
    expect(p2Result?.detailedScore[0]).toEqual({ normal: 1_234 });
    // fabricated from the leaderboard, not a real published score — must not be shown as a real run
    expect(p2Result?.incomplete).toBe(true);
  });

  it('rejects end-game from non-hosts or outside a game', async () => {
    const room = createRoom();
    join(room, ['p1', 'p2']);
    expect(() => room.handlers.room.endGame.handler(ctx('p1'))).toThrow('No game in progress');
    await startSinging(room, ['p1', 'p2']);
    expect(() => room.handlers.room.endGame.handler(ctx('p2'))).toThrow('Only the host');
  });
});

describe('host-only synced seek (skip intro)', () => {
  it('moves the playback anchor for everyone when the host seeks', async () => {
    const room = createRoom();
    join(room, ['p1', 'p2']);
    await startSinging(room, ['p1', 'p2']);

    await room.handlers.playback.seek.handler(ctx('p1'), 42_000);
    expect(room.logic.getState().playbackAnchor).toEqual({ serverTimeMs: Date.now(), videoTimeMs: 42_000 });
  });

  it('rejects seeks from non-hosts', async () => {
    const room = createRoom();
    join(room, ['p1', 'p2']);
    await startSinging(room, ['p1', 'p2']);

    expect(() => room.handlers.playback.seek.handler(ctx('p2'), 42_000)).toThrow('Only the host');
  });
});

describe('song votes', () => {
  it('collects votes per participant and clears them when a song is selected', async () => {
    const room = createRoom();
    join(room, ['p1', 'p2']);

    await room.handlers.selection.voteSong.handler(ctx('p2'), 'song-1', 'up');
    expect(room.published['song-votes'].at(-1)).toEqual({ p2: { songId: 'song-1', vote: 'up' } });

    await room.handlers.selection.voteSong.handler(ctx('p2'), 'song-1', null);
    expect(room.published['song-votes'].at(-1)).toEqual({});

    await room.handlers.selection.voteSong.handler(ctx('p2'), 'song-1', 'down');
    await uploadChart(room);
    expect(room.published['song-votes'].at(-1)).toEqual({});
  });
});

describe('scoring and results', () => {
  it('keeps a sorted leaderboard from published score snapshots', async () => {
    const room = createRoom();
    join(room, ['p1', 'p2']);
    await startSinging(room, ['p1', 'p2']);

    await room.handlers.scoring.publishScore.handler(ctx('p1'), 100);
    await room.handlers.scoring.publishScore.handler(ctx('p2'), 250);
    vi.advanceTimersByTime(ONLINE_LEADERBOARD_PUBLISH_MS);

    const leaderboard = room.published['leaderboard'].at(-1) as Array<{ participantId: string; score: number }>;
    expect(leaderboard.map((entry) => entry.participantId)).toEqual(['p2', 'p1']);
  });

  it('coalesces leaderboard broadcasts to at most one per interval', async () => {
    const room = createRoom();
    join(room, ['p1', 'p2']);
    await startSinging(room, ['p1', 'p2']);

    const publishesBefore = room.published['leaderboard'].length;
    for (let i = 1; i <= 10; i++) {
      await room.handlers.scoring.publishScore.handler(ctx('p1'), i * 10);
    }
    // Leading publish only — the rest are pending until the cooldown elapses
    expect(room.published['leaderboard'].length).toBe(publishesBefore + 1);

    vi.advanceTimersByTime(ONLINE_LEADERBOARD_PUBLISH_MS);
    expect(room.published['leaderboard'].length).toBe(publishesBefore + 2);
    const latest = room.published['leaderboard'].at(-1) as Array<{ participantId: string; score: number }>;
    expect(latest.find((entry) => entry.participantId === 'p1')?.score).toBe(100);
  });

  it('does not broadcast room state for plain playback status reports', async () => {
    const room = createRoom();
    join(room, ['p1', 'p2']);
    await startSinging(room, ['p1', 'p2']);

    const statePublishesBefore = room.published['room-state'].length;
    await room.handlers.playback.reportStatus.handler(ctx('p1'), 'playing');
    await room.handlers.playback.reportStatus.handler(ctx('p2'), 'playing');
    await room.handlers.playback.reportStatus.handler(ctx('p1'), 'paused');
    expect(room.published['room-state'].length).toBe(statePublishesBefore);
  });

  it('moves to results once every connected singer published a final score', async () => {
    const room = createRoom();
    join(room, ['p1', 'p2']);
    await startSinging(room, ['p1', 'p2']);

    await room.handlers.scoring.publishFinal.handler(ctx('p1'), SAMPLE_DETAILED_SCORE);
    expect(room.logic.getState().phase).toBe('singing');

    await room.handlers.scoring.publishFinal.handler(ctx('p2'), SAMPLE_DETAILED_SCORE);
    const state = room.logic.getState();
    expect(state.phase).toBe('results');
    expect(state.finalResults).toHaveLength(2);
  });

  it('does not wait for singers that disconnected mid-song (after grace)', async () => {
    const room = createRoom();
    join(room, ['p1', 'p2']);
    await startSinging(room, ['p1', 'p2']);

    await room.handlers.scoring.publishFinal.handler(ctx('p1'), SAMPLE_DETAILED_SCORE);
    room.logic.handleDisconnect('p2');
    vi.advanceTimersByTime(ONLINE_RECONNECT_GRACE_MS);

    expect(room.logic.getState().phase).toBe('results');
  });

  it('returns to the lobby for another song', async () => {
    const room = createRoom();
    join(room, ['p1', 'p2']);
    await startSinging(room, ['p1', 'p2']);
    await room.handlers.scoring.publishFinal.handler(ctx('p1'), SAMPLE_DETAILED_SCORE);
    await room.handlers.scoring.publishFinal.handler(ctx('p2'), SAMPLE_DETAILED_SCORE);

    await room.handlers.room.returnToLobby.handler(ctx('p2'));
    const state = room.logic.getState();
    expect(state.phase).toBe('lobby');
    expect(state.finalResults).toBeNull();
    expect(state.participants.every((participant) => !participant.ready)).toBe(true);
    // the finished song is no longer selected — the next round starts fresh
    expect(state.chart).toBeNull();
    expect(room.published['song-votes'].at(-1)).toEqual({});
  });
});

describe('room TTL', () => {
  it('schedules TTL cleanup on activity and expires only when idle and empty', async () => {
    const room = createRoom();
    join(room, ['p1']);
    expect(room.scheduleWake).toHaveBeenCalledWith(Date.now() + ONLINE_ROOM_TTL_MS);
    expect(room.logic.isExpired()).toBe(false);

    room.logic.handleDisconnect('p1');
    // grace expiry is the last activity; the TTL clock runs from there
    vi.advanceTimersByTime(ONLINE_RECONNECT_GRACE_MS);
    expect(room.logic.isExpired()).toBe(false);
    vi.advanceTimersByTime(ONLINE_ROOM_TTL_MS);
    expect(room.logic.isExpired()).toBe(true);
  });

  it('persists state on every change', async () => {
    const room = createRoom();
    join(room, ['p1']);
    await uploadChart(room);
    const persisted = room.persist.mock.calls.at(-1)?.[0];
    expect(persisted.chartData).toEqual(chartData);
    expect(persisted.participants).toHaveLength(1);
  });
});

describe('restoring from a persisted snapshot (hibernation/restart)', () => {
  it('rebuilds participants (disconnected), host, ban list, created state and phase', async () => {
    const source = createRoom();
    join(source, ['p1', 'p2', 'p3']);
    // p3 is banned before the snapshot is taken — the ban must survive the restart
    await source.handlers.room.kickPlayer.handler(ctx('p1'), 'p3');
    await uploadChart(source);
    await source.handlers.room.startGame.handler(ctx('p1'));
    expect(source.logic.getState().phase).toBe('readiness');

    const snapshot = source.logic.snapshot();
    const restored = createRoom(snapshot);
    const state = restored.logic.getState();

    // 'readiness' depends on live timers/anchors that don't survive a restart
    expect(state.phase).toBe('lobby');
    expect(state.hostId).toBe('p1');
    expect(state.participants.map((participant) => participant.id)).toEqual(['p1', 'p2']);
    expect(state.participants.every((participant) => !participant.connected && !participant.ready)).toBe(true);
    expect(restored.logic.isCreated()).toBe(true);
    expect(state.chart?.songId).toBe('song-1');
    // the ban list survives the restart
    expect(restored.logic.handleConnect('p3', 'Name p3')).toEqual({ accepted: false, reason: 'banned' });
  });

  it('arms a grace timer for every restored participant so stale ones get cleaned up', async () => {
    const source = createRoom();
    join(source, ['p1', 'p2']);
    const snapshot = source.logic.snapshot();

    const restored = createRoom(snapshot);
    expect(restored.logic.getState().participants).toHaveLength(2);

    // no one reconnects — without an armed grace timer these would linger forever
    vi.advanceTimersByTime(ONLINE_RECONNECT_GRACE_MS);
    expect(restored.logic.getState().participants).toHaveLength(0);
  });

  it('handles blobs from before late-persisted fields existed', () => {
    const source = createRoom();
    join(source, ['p1']);
    const {
      chartPreview: _chartPreview,
      bannedIds: _bannedIds,
      created: _created,
      ...legacySnapshot
    } = source.logic.snapshot();

    const restored = createRoom(legacySnapshot);
    const state = restored.logic.getState();
    expect(state.chart).toBeNull();
    expect(restored.logic.isCreated()).toBe(true);
    expect(restored.logic.handleConnect('p1', 'Name p1')).toEqual({ accepted: true });
  });
});

describe('restoring during a hibernation wake (some connections still live)', () => {
  it('keeps live participants connected and never arms a grace timer for them', async () => {
    const source = createRoom();
    join(source, ['p1', 'p2', 'p3']);
    const snapshot = source.logic.snapshot();

    // p2's socket genuinely dropped in the gap; p1 and p3 never actually disconnected
    const restored = createRoom(snapshot, new Set(['p1', 'p3']));
    const state = restored.logic.getState();
    expect(state.participants.find((p) => p.id === 'p1')?.connected).toBe(true);
    expect(state.participants.find((p) => p.id === 'p3')?.connected).toBe(true);
    expect(state.participants.find((p) => p.id === 'p2')?.connected).toBe(false);

    vi.advanceTimersByTime(ONLINE_RECONNECT_GRACE_MS);
    const survivors = restored.logic.getState().participants.map((p) => p.id);
    expect(survivors).toEqual(['p1', 'p3']);
  });

  it('re-arms a partially-elapsed grace window with the remaining time, not a fresh one, across repeated wakes', async () => {
    const source = createRoom();
    join(source, ['p1', 'p2']);
    source.logic.handleDisconnect('p1'); // p2 stays live throughout

    vi.advanceTimersByTime(ONLINE_RECONNECT_GRACE_MS - 1_000); // 1s of grace left
    const snapshot1 = source.logic.snapshot();
    const originalDeadline = snapshot1.participants.find((p) => p.id === 'p1')?.graceDeadline;
    expect(originalDeadline).toBe(Date.now() + 1_000);

    const wake1 = createRoom(snapshot1, new Set(['p2']));
    expect(wake1.logic.getState().participants.find((p) => p.id === 'p1')?.graceDeadline).toBe(originalDeadline);

    vi.advanceTimersByTime(500); // 500ms of grace left — still short of the deadline
    expect(wake1.logic.getState().participants.map((p) => p.id)).toEqual(['p1', 'p2']);

    // A second wake must not push the deadline out again
    const snapshot2 = wake1.logic.snapshot();
    const wake2 = createRoom(snapshot2, new Set(['p2']));
    expect(wake2.logic.getState().participants.find((p) => p.id === 'p1')?.graceDeadline).toBe(originalDeadline);

    vi.advanceTimersByTime(500); // reaches the original deadline, not a deadline extended by either wake
    expect(wake2.logic.getState().participants.map((p) => p.id)).toEqual(['p2']);
  });

  it('cleans up promptly when the grace deadline already passed during the hibernation gap', async () => {
    const source = createRoom();
    join(source, ['p1', 'p2']);
    source.logic.handleDisconnect('p1');
    // Snapshot before the deadline passes — `source`'s own timer firing afterwards is irrelevant,
    // it represents the process that hibernated before its timer ever got to run.
    const snapshot = source.logic.snapshot();

    vi.advanceTimersByTime(ONLINE_RECONNECT_GRACE_MS + 5_000); // the DO woke up long after the deadline passed

    const restored = createRoom(snapshot, new Set(['p2']));
    // still present at construction time — the timer fires on the next tick, not synchronously
    expect(restored.logic.getState().participants.map((p) => p.id)).toEqual(['p1', 'p2']);

    vi.advanceTimersByTime(0);
    expect(restored.logic.getState().participants.map((p) => p.id)).toEqual(['p2']);
  });

  it('resumes an in-progress readiness countdown on schedule and keeps confirmed readiness', async () => {
    const source = createRoom();
    join(source, ['p1', 'p2']);
    await uploadChart(source);
    await source.handlers.room.startGame.handler(ctx('p1'));
    await source.handlers.room.setReady.handler(ctx('p1'), true);
    vi.advanceTimersByTime(3_000);

    const snapshot = source.logic.snapshot();
    const restored = createRoom(snapshot, new Set(['p1', 'p2']));
    const state = restored.logic.getState();
    expect(state.phase).toBe('readiness');
    expect(state.participants.find((p) => p.id === 'p1')?.ready).toBe(true);
    expect(state.readinessDeadline).toBe(snapshot.readinessDeadline);

    // the original deadline is honored, not restarted from a fresh full timeout
    vi.advanceTimersByTime(ONLINE_READINESS_TIMEOUT_MS - 3_000);
    expect(restored.logic.getState().phase).toBe('singing');
  });

  it('keeps a live room in the singing phase with its playback anchor intact', async () => {
    const source = createRoom();
    join(source, ['p1', 'p2']);
    await startSinging(source, ['p1', 'p2']);
    vi.advanceTimersByTime(5_000);

    const snapshot = source.logic.snapshot();
    const restored = createRoom(snapshot, new Set(['p1', 'p2']));
    const state = restored.logic.getState();
    expect(state.phase).toBe('singing');
    expect(state.playbackAnchor).toEqual(snapshot.playbackAnchor);
  });

  it('re-arms the resume countdown mid pause/resume', async () => {
    const source = createRoom();
    join(source, ['p1', 'p2']);
    await startSinging(source, ['p1', 'p2']);
    await source.handlers.playback.pause.handler(ctx('p1'));
    await source.handlers.playback.resume.handler(ctx('p2'));
    vi.advanceTimersByTime(1_000);

    const snapshot = source.logic.snapshot();
    const restored = createRoom(snapshot, new Set(['p1', 'p2']));
    expect(restored.logic.getState().resumeCountdownEndsAt).toBe(snapshot.resumeCountdownEndsAt);

    vi.advanceTimersByTime(ONLINE_RESUME_COUNTDOWN_MS - 1_000);
    const resumed = restored.logic.getState();
    expect(resumed.pause).toBeNull();
    expect(resumed.playbackAnchor).not.toBeNull();
  });

  it('re-arms the force-results timer for a pending endGame', async () => {
    const source = createRoom();
    join(source, ['p1', 'p2']);
    await startSinging(source, ['p1', 'p2']);
    await source.handlers.room.endGame.handler(ctx('p1'));
    vi.advanceTimersByTime(2_000);

    const snapshot = source.logic.snapshot();
    const restored = createRoom(snapshot, new Set(['p1', 'p2']));
    expect(restored.logic.getState().finishRequestedAt).toBe(snapshot.finishRequestedAt);

    vi.advanceTimersByTime(ONLINE_FORCE_RESULTS_MS - 2_000);
    expect(restored.logic.getState().phase).toBe('results');
  });

  it('falls back to null for mid-song fields missing from a pre-refactor blob, without crashing', async () => {
    const source = createRoom();
    join(source, ['p1', 'p2']);
    await startSinging(source, ['p1', 'p2']);
    const {
      playbackAnchor: _playbackAnchor,
      readinessDeadline: _readinessDeadline,
      pause: _pause,
      resumeCountdownEndsAt: _resumeCountdownEndsAt,
      finishRequestedAt: _finishRequestedAt,
      ...legacySnapshot
    } = source.logic.snapshot();

    const restored = createRoom(legacySnapshot, new Set(['p1', 'p2']));
    const state = restored.logic.getState();
    expect(state.phase).toBe('singing');
    expect(state.playbackAnchor).toBeNull();
    expect(state.readinessDeadline).toBeNull();
  });
});

describe('hibernation-safe alarms', () => {
  it('arms the room alarm for the nearest deadline, grace ahead of the TTL', () => {
    const room = createRoom();
    join(room, ['p1', 'p2']);
    expect(room.scheduleWake).toHaveBeenLastCalledWith(Date.now() + ONLINE_ROOM_TTL_MS);

    room.logic.handleDisconnect('p2');
    expect(room.scheduleWake).toHaveBeenLastCalledWith(Date.now() + ONLINE_RECONNECT_GRACE_MS);
  });

  it('expires a grace window from the alarm alone, with no live timers left', () => {
    const room = createRoom();
    join(room, ['p1', 'p2']);
    room.logic.handleDisconnect('p2');

    // A hibernated party has lost every setTimeout it armed, and an idle lobby sends nothing that
    // would wake it — moving the clock without running timers is exactly that situation. The alarm
    // firing is the only thing that happens.
    vi.setSystemTime(Date.now() + ONLINE_RECONNECT_GRACE_MS);
    room.logic.handleAlarm();

    expect(room.logic.getState().participants.map((participant) => participant.id)).toEqual(['p1']);
    // and the host role moves on with it
    expect(room.logic.getState().hostId).toBe('p1');
  });

  it('re-arms for the TTL once the last grace window has been spent', () => {
    const room = createRoom();
    join(room, ['p1', 'p2']);
    room.logic.handleDisconnect('p2');

    vi.setSystemTime(Date.now() + ONLINE_RECONNECT_GRACE_MS);
    room.logic.handleAlarm();

    expect(room.scheduleWake).toHaveBeenLastCalledWith(Date.now() + ONLINE_ROOM_TTL_MS);
    expect(room.destroy).not.toHaveBeenCalled();
  });

  it('wipes the room when the TTL deadline comes due', () => {
    const room = createRoom();
    join(room, ['p1']);
    room.logic.handleDisconnect('p1');

    vi.setSystemTime(Date.now() + ONLINE_ROOM_TTL_MS);
    room.logic.handleAlarm();

    expect(room.destroy).toHaveBeenCalled();
  });

  it('keeps a room whose singers are merely quiet, and pushes the TTL out instead', () => {
    const room = createRoom();
    join(room, ['p1', 'p2']);

    // Neither pings nor stats reports touch the room's state, so a lobby of idle singers reaches
    // the TTL deadline with everyone still connected. Wiping storage here would evaporate the room
    // out from under their live sockets on the next hibernation wake.
    vi.setSystemTime(Date.now() + ONLINE_ROOM_TTL_MS);
    room.logic.handleAlarm();

    expect(room.destroy).not.toHaveBeenCalled();
    expect(room.logic.getState().participants).toHaveLength(2);
    expect(room.scheduleWake).toHaveBeenLastCalledWith(Date.now() + ONLINE_ROOM_TTL_MS);

    // and it does go when the last of them is finally gone
    room.logic.handleDisconnect('p1');
    room.logic.handleDisconnect('p2');
    vi.setSystemTime(Date.now() + ONLINE_RECONNECT_GRACE_MS + ONLINE_ROOM_TTL_MS);
    room.logic.handleAlarm();
    expect(room.destroy).toHaveBeenCalled();
  });

  it('restores the pending deadlines after a wake, so a dropped singer is still cleaned up', () => {
    const source = createRoom();
    join(source, ['p1', 'p2']);
    source.logic.handleDisconnect('p2');
    const persisted = source.logic.snapshot();

    // p1 is still attached — a hibernation wake, not a restart
    const woken = createRoom(persisted, new Set(['p1']));
    expect(woken.scheduleWake).toHaveBeenLastCalledWith(persisted.participants[1].graceDeadline);

    vi.setSystemTime(Date.now() + ONLINE_RECONNECT_GRACE_MS);
    woken.logic.handleAlarm();
    expect(woken.logic.getState().participants.map((participant) => participant.id)).toEqual(['p1']);
  });
});
