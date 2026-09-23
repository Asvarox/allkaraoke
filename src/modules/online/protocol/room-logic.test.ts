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
  ONLINE_CHAT_BURST_LIMIT,
  ONLINE_CHAT_BURST_WINDOW_MS,
  ONLINE_CHAT_HISTORY_SIZE,
  ONLINE_CHAT_RATE_LIMIT,
  ONLINE_CHAT_RATE_LIMIT_ERROR,
  ONLINE_CHAT_RATE_WINDOW_MS,
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
import { ChatMessage, WireDetailedScore } from '~/modules/online/protocol/types';
import { ONLINE_MAX_PLAYERS } from '~/modules/players/player-number';

const ctx = (senderId: string): RpcContext => ({ senderId, permission: 'write', removePlayer: () => undefined });

const CHART_TXT = '#ARTIST:Some Artist\n#TITLE:Some Song\n: 0 4 59 Test\nE';
let manifest: Awaited<ReturnType<typeof prepareChartTransfer>>['manifest'];
let chartData: string;

/** A single emoji, which is two UTF-16 units — the shape that a naive `slice` breaks. */
const GRINNING = '\u{1F600}';

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

/** A whole song, start to finish: `scores` is what each singer ends on, and the room is left back
 * in the lobby. */
const playSong = async (room: Room, ids: string[], scores: Record<string, number>, hostId = 'p1') => {
  await startSinging(room, ids, hostId);
  for (const id of ids) {
    if (scores[id] !== undefined) await room.handlers.scoring.publishScore.handler(ctx(id), scores[id]);
  }
  for (const id of ids) {
    await room.handlers.scoring.publishFinal.handler(ctx(id), SAMPLE_DETAILED_SCORE);
  }
  await room.handlers.room.returnToLobby.handler(ctx(hostId));
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

describe('room standings across songs', () => {
  it('adds each song to the running total and keeps the last one on its own', async () => {
    const room = createRoom();
    join(room, ['p1', 'p2']);

    await playSong(room, ['p1', 'p2'], { p1: 100, p2: 250 });
    expect(room.logic.getState().roomScores).toEqual({
      p1: { total: 100, lastSong: 100 },
      p2: { total: 250, lastSong: 250 },
    });

    await playSong(room, ['p1', 'p2'], { p1: 400, p2: 10 });
    expect(room.logic.getState().roomScores).toEqual({
      p1: { total: 500, lastSong: 400 },
      p2: { total: 260, lastSong: 10 },
    });
  });

  it('gives a singer who has not sung yet no row at all, rather than a zero', async () => {
    const room = createRoom();
    join(room, ['p1', 'p2']);
    await playSong(room, ['p1', 'p2'], { p1: 100, p2: 50 });

    join(room, ['p3']);
    expect(room.logic.getState().roomScores?.p3).toBeUndefined();

    await playSong(room, ['p1', 'p2', 'p3'], { p1: 10, p2: 20, p3: 30 });
    expect(room.logic.getState().roomScores?.p3).toEqual({ total: 30, lastSong: 30 });
  });

  it('empties the last-song column for a singer the song passed by, leaving their total alone', async () => {
    const room = createRoom();
    join(room, ['p1', 'p2']);
    await playSong(room, ['p1', 'p2'], { p1: 100, p2: 50 });

    // p3 walks in halfway through the next song: in the room, but never in its leaderboard
    await startSinging(room, ['p1', 'p2']);
    join(room, ['p3']);
    await room.handlers.scoring.publishScore.handler(ctx('p1'), 7);
    await room.handlers.scoring.publishScore.handler(ctx('p2'), 3);
    await room.handlers.room.endGame.handler(ctx('p1'));
    vi.advanceTimersByTime(ONLINE_FORCE_RESULTS_MS);

    expect(room.logic.getState().roomScores).toEqual({
      p1: { total: 107, lastSong: 7 },
      p2: { total: 53, lastSong: 3 },
    });
  });

  it('keeps the total of a singer who sat a song out, and empties only their last song', async () => {
    const room = createRoom();
    join(room, ['p1', 'p2', 'p3']);
    await playSong(room, ['p1', 'p2', 'p3'], { p1: 100, p2: 50, p3: 30 });

    // p3 is away when the next song starts, so it goes ahead without them in its leaderboard
    room.logic.handleDisconnect('p3');
    await startSinging(room, ['p1', 'p2']);
    // back inside the reconnect grace window, before the song ends
    join(room, ['p3']);
    await room.handlers.scoring.publishScore.handler(ctx('p1'), 7);
    await room.handlers.scoring.publishScore.handler(ctx('p2'), 3);
    await room.handlers.room.endGame.handler(ctx('p1'));
    vi.advanceTimersByTime(ONLINE_FORCE_RESULTS_MS);

    expect(room.logic.getState().roomScores?.p3).toEqual({ total: 30, lastSong: null });
  });

  it("drops a singer's standings when they leave for good, so coming back starts from nothing", async () => {
    const room = createRoom();
    join(room, ['p1', 'p2']);
    await playSong(room, ['p1', 'p2'], { p1: 100, p2: 250 });

    room.logic.handleDisconnect('p2');
    // Still theirs for as long as the reconnect window is open — a refresh is not leaving
    expect(room.logic.getState().roomScores?.p2).toEqual({ total: 250, lastSong: 250 });

    vi.advanceTimersByTime(ONLINE_RECONNECT_GRACE_MS);
    expect(room.logic.getState().roomScores?.p2).toBeUndefined();

    join(room, ['p2']);
    expect(room.logic.getState().roomScores?.p2).toBeUndefined();
  });

  it('leaves the standings alone when the song is ended before anyone sang it', async () => {
    const room = createRoom();
    join(room, ['p1', 'p2']);
    await playSong(room, ['p1', 'p2'], { p1: 100, p2: 250 });

    await uploadChart(room, 'p1');
    await room.handlers.room.startGame.handler(ctx('p1'));
    await room.handlers.room.endGame.handler(ctx('p1'));
    vi.advanceTimersByTime(ONLINE_FORCE_RESULTS_MS);

    expect(room.logic.getState().phase).toBe('results');
    expect(room.logic.getState().roomScores).toEqual({
      p1: { total: 100, lastSong: 100 },
      p2: { total: 250, lastSong: 250 },
    });
  });

  it('carries the standings through a restore', async () => {
    const source = createRoom();
    join(source, ['p1', 'p2']);
    await playSong(source, ['p1', 'p2'], { p1: 100, p2: 250 });

    const restored = createRoom(source.logic.snapshot(), new Set(['p1', 'p2']));
    expect(restored.logic.getState().roomScores).toEqual({
      p1: { total: 100, lastSong: 100 },
      p2: { total: 250, lastSong: 250 },
    });
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

describe('chat', () => {
  // Both chat handlers are synchronous, but `defineMutation`/`defineQuery` type every handler's
  // return as `T | Promise<T>` for the async ones' sake — asserted here rather than at each of the
  // couple of dozen call sites below.
  const say = (room: Room, id: string, text: string, messageId = `${id}-${Math.random()}`) =>
    room.handlers.chat.send.handler(ctx(id), text, messageId) as ChatMessage;

  const history = (room: Room, id = 'p1') => room.handlers.chat.getHistory.handler(ctx(id)) as ChatMessage[];

  it('broadcasts the message it accepted and keeps it in the history', () => {
    const room = createRoom();
    join(room, ['p1', 'p2']);

    const sent = say(room, 'p2', 'hello everyone');

    expect(sent.text).toBe('hello everyone');
    expect(sent.authorId).toBe('p2');
    expect(room.published.chat).toEqual([sent]);
    expect(history(room)).toEqual([sent]);
  });

  it('stamps the name the author had at the time, and never revisits it', async () => {
    const room = createRoom();
    join(room, ['p1', 'p2']);
    await room.handlers.room.setName.handler(ctx('p2'), 'Before');

    const sent = say(room, 'p2', 'said as Before');
    await room.handlers.room.setName.handler(ctx('p2'), 'After');

    expect(sent.authorName).toBe('Before');
    expect(history(room)[0].authorName).toBe('Before');
  });

  it('rejects a message from someone who is not in the room', () => {
    const room = createRoom();
    join(room, ['p1']);
    expect(() => say(room, 'stranger', 'let me in')).toThrow('Not a participant');
  });

  describe('normalization', () => {
    it('truncates by code point, so an emoji at the limit is not cut in half', () => {
      const room = createRoom();
      join(room, ['p1']);
      // Each of these is two UTF-16 units; `slice` would leave a lone surrogate at the boundary.
      const sent = say(room, 'p1', GRINNING.repeat(250));
      expect([...sent.text]).toHaveLength(200);
      expect(sent.text.endsWith(GRINNING)).toBe(true);
    });

    it('turns newlines and tabs into spaces rather than deleting them', () => {
      const room = createRoom();
      join(room, ['p1']);
      expect(say(room, 'p1', 'one\ntwo\tthree').text).toBe('one two three');
    });

    it('drops control characters', () => {
      const room = createRoom();
      join(room, ['p1']);
      expect(say(room, 'p1', 'clean text').text).toBe('cleantext');
    });

    it('refuses a message that is empty once trimmed', () => {
      const room = createRoom();
      join(room, ['p1']);
      expect(() => say(room, 'p1', '   \n  ')).toThrow('Nothing to send');
      expect(history(room)).toEqual([]);
    });
  });

  describe('rate limiting', () => {
    it('allows the sustained rate but refuses a burst', () => {
      const room = createRoom();
      join(room, ['p1']);

      for (let i = 0; i < ONLINE_CHAT_BURST_LIMIT; i++) say(room, 'p1', `burst ${i}`);
      expect(() => say(room, 'p1', 'one too many')).toThrow(ONLINE_CHAT_RATE_LIMIT_ERROR);

      // Once the burst window has rolled past, the same client is welcome again.
      vi.advanceTimersByTime(ONLINE_CHAT_BURST_WINDOW_MS);
      expect(say(room, 'p1', 'after the burst window').text).toBe('after the burst window');
    });

    it('refuses past the sustained limit even when nothing is bursty', () => {
      const room = createRoom();
      join(room, ['p1']);

      // Spread out enough that the burst window never fills up.
      for (let i = 0; i < ONLINE_CHAT_RATE_LIMIT; i++) {
        say(room, 'p1', `paced ${i}`);
        vi.advanceTimersByTime(ONLINE_CHAT_BURST_WINDOW_MS / ONLINE_CHAT_BURST_LIMIT + 1);
      }
      expect(() => say(room, 'p1', 'over the minute')).toThrow(ONLINE_CHAT_RATE_LIMIT_ERROR);

      vi.advanceTimersByTime(ONLINE_CHAT_RATE_WINDOW_MS);
      expect(say(room, 'p1', 'a minute later').text).toBe('a minute later');
    });

    it('limits each singer separately', () => {
      const room = createRoom();
      join(room, ['p1', 'p2']);

      for (let i = 0; i < ONLINE_CHAT_BURST_LIMIT; i++) say(room, 'p1', `burst ${i}`);
      expect(() => say(room, 'p1', 'p1 is done')).toThrow(ONLINE_CHAT_RATE_LIMIT_ERROR);
      expect(say(room, 'p2', 'p2 is fine').text).toBe('p2 is fine');
    });

    it('does not count a refused message against the sender', () => {
      const room = createRoom();
      join(room, ['p1']);

      for (let i = 0; i < ONLINE_CHAT_BURST_LIMIT; i++) say(room, 'p1', `burst ${i}`);
      // Hammering while throttled must not push the window along — otherwise being rate limited
      // would extend the rate limit.
      for (let i = 0; i < 20; i++) expect(() => say(room, 'p1', 'again')).toThrow();

      vi.advanceTimersByTime(ONLINE_CHAT_BURST_WINDOW_MS);
      expect(say(room, 'p1', 'let me back in').text).toBe('let me back in');
    });
  });

  describe('ids', () => {
    it('keeps the suffix the sender minted, under the author the room resolved', () => {
      const room = createRoom();
      join(room, ['p1']);
      expect(say(room, 'p1', 'mine', 'chosen-id').id).toBe('p1:chosen-id');
    });

    it("namespaces ids by author, so one singer cannot name another singer's message", () => {
      const room = createRoom();
      join(room, ['p1', 'p2']);
      const mine = say(room, 'p1', 'first', 'same-suffix');

      // Same suffix from a different singer: the author half differs, so it lands as its own
      // message instead of replacing the first one on every client still showing it.
      const theirs = say(room, 'p2', 'trying to reuse that id', 'same-suffix');

      expect(mine.id).toBe('p1:same-suffix');
      expect(theirs.id).toBe('p2:same-suffix');
      const stored = history(room);
      expect(stored).toHaveLength(2);
      expect(stored[0].text).toBe('first');
    });

    it('re-mints when the sender reuses one of their own ids', () => {
      const room = createRoom();
      join(room, ['p1']);
      say(room, 'p1', 'first', 'duplicate-id');

      const second = say(room, 'p1', 'same id again', 'duplicate-id');

      expect(second.id).not.toBe('p1:duplicate-id');
      expect(history(room)).toHaveLength(2);
    });

    it('strips anything id-shaped out of a proposed suffix', () => {
      const room = createRoom();
      join(room, ['p1']);
      // The id is echoed to every client and used as a React key — it carries no free text.
      expect(say(room, 'p1', 'hello', '../../evil id!').id).toBe('p1:evilid');
    });
  });

  describe('history', () => {
    it('keeps the newest ONLINE_CHAT_HISTORY_SIZE and drops the oldest', () => {
      const room = createRoom();
      join(room, ['p1']);

      for (let i = 0; i < ONLINE_CHAT_HISTORY_SIZE + 10; i++) {
        say(room, 'p1', `message ${i}`);
        // Stay under the rate limit — this is a history test, not a throttling one.
        vi.advanceTimersByTime(ONLINE_CHAT_RATE_WINDOW_MS);
      }

      const stored = history(room);
      expect(stored).toHaveLength(ONLINE_CHAT_HISTORY_SIZE);
      expect(stored[0].text).toBe('message 10');
      expect(stored[stored.length - 1].text).toBe(`message ${ONLINE_CHAT_HISTORY_SIZE + 9}`);
    });

    it('survives into a room restored from a snapshot', () => {
      const room = createRoom();
      join(room, ['p1', 'p2']);
      say(room, 'p1', 'said before the handover');

      const successor = createRoom(room.logic.snapshot(), new Set(['p2']));

      expect(history(successor, 'p2')).toEqual([expect.objectContaining({ text: 'said before the handover' })]);
    });

    it('starts empty for a room restored from a snapshot that predates chat', () => {
      const room = createRoom();
      join(room, ['p1']);
      const legacy = { ...room.logic.snapshot() } as OnlinePersistedState;
      delete (legacy as { chat?: unknown }).chat;

      const restored = createRoom(legacy, new Set(['p1']));

      expect(history(restored)).toEqual([]);
    });
  });

  describe('persistence', () => {
    it('writes a lone message out rather than leaving it in memory', () => {
      const room = createRoom();
      join(room, ['p1', 'p2']);
      room.persist.mockClear();

      say(room, 'p2', 'said once, then quiet');

      // The PartyKit room has no periodic write of its own, so a message that never persists is
      // lost the moment it hibernates — acknowledged to the sender and gone.
      expect(room.persist).toHaveBeenCalledTimes(1);
      const written = room.persist.mock.calls[0][0] as OnlinePersistedState;
      expect(written.chat).toEqual([expect.objectContaining({ text: 'said once, then quiet' })]);
    });

    it('coalesces a burst into far fewer writes than messages', () => {
      const room = createRoom();
      join(room, ['p1', 'p2']);
      room.persist.mockClear();

      // Spread just enough to stay under the burst limit while staying well inside one persist
      // window, so the coalescing is what is being measured rather than the rate limiter.
      for (let i = 0; i < 4; i++) {
        say(room, 'p2', `burst ${i}`);
        vi.advanceTimersByTime(ONLINE_CHAT_BURST_WINDOW_MS / ONLINE_CHAT_BURST_LIMIT + 1);
      }

      // The whole history rides the snapshot, and in a P2P room persisting broadcasts it to the
      // succession line — a write per message would put the entire backlog on the wire for every
      // line sent.
      expect(room.persist.mock.calls.length).toBeLessThan(4);
      expect(room.persist).toHaveBeenCalled();
    });

    it('counts a message as activity, pushing the room TTL out', () => {
      const room = createRoom();
      join(room, ['p1', 'p2']);

      vi.advanceTimersByTime(ONLINE_ROOM_TTL_MS / 2);
      room.scheduleWake.mockClear();
      say(room, 'p2', 'still here');

      expect(room.scheduleWake).toHaveBeenCalledWith(Date.now() + ONLINE_ROOM_TTL_MS);
    });
  });

  it('refuses the backlog to someone who is not in the room', () => {
    const room = createRoom();
    join(room, ['p1']);
    say(room, 'p1', 'members only');

    expect(() => room.handlers.chat.getHistory.handler(ctx('stranger'))).toThrow('Not a participant');
  });
});
