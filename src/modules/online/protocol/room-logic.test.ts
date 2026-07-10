import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { compressChart, prepareChartTransfer, unpackChartTransfer } from '~/modules/online/protocol/chart-transfer';
import {
  ONLINE_BUFFERING_PAUSE_MS,
  ONLINE_COUNTDOWN_MS,
  ONLINE_FORCE_RESULTS_MS,
  ONLINE_LEADERBOARD_PUBLISH_MS,
  ONLINE_MAX_PLAYERS,
  ONLINE_PROBE_TIMEOUT_MS,
  ONLINE_RECONNECT_GRACE_MS,
  ONLINE_RESUME_COUNTDOWN_MS,
  ONLINE_ROOM_TTL_MS,
} from '~/modules/online/protocol/consts';
import { OnlineRoomLogic } from '~/modules/online/protocol/room-logic';
import { RpcContext } from '~/modules/remote-mic/network/rpc/types';

const ctx = (senderId: string): RpcContext => ({ senderId, permission: 'write', removePlayer: () => undefined });

const CHART_TXT = '#ARTIST:Some Artist\n#TITLE:Some Song\n: 0 4 59 Test\nE';
let manifest: Awaited<ReturnType<typeof prepareChartTransfer>>['manifest'];
let chartData: string;

// Compress once with real timers, before the fake-timer hooks kick in
beforeAll(async () => {
  ({ manifest, data: chartData } = await prepareChartTransfer(
    { songId: 'song-1', artist: 'Some Artist', title: 'Some Song', video: 'video1' },
    CHART_TXT,
  ));
});

const createRoom = () => {
  const published: Record<string, unknown[]> = {};
  const persist = vi.fn();
  const scheduleTtl = vi.fn();
  const disconnect = vi.fn();
  const logic = new OnlineRoomLogic({
    roomCode: 'testr',
    now: () => Date.now(),
    publish: (channel, data) => {
      (published[channel] ??= []).push(data);
    },
    persist,
    scheduleTtl,
    disconnect,
  });
  const handlers = logic.createHandlers();
  return { logic, handlers, published, persist, scheduleTtl, disconnect };
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

const readyAndProbeAll = async (room: Room, ids: string[]) => {
  for (const id of ids) {
    await room.handlers.room.setReady.handler(ctx(id), true);
  }
  for (const id of ids) {
    await room.handlers.room.reportProbe.handler(ctx(id), true);
  }
};

const startSinging = async (room: Room, ids: string[]) => {
  await uploadChart(room);
  await readyAndProbeAll(room, ids);
  expect(room.logic.getState().phase).toBe('countdown');
  vi.advanceTimersByTime(ONLINE_COUNTDOWN_MS);
  expect(room.logic.getState().phase).toBe('singing');
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

    vi.advanceTimersByTime(1_000);
    expect(room.published['player-stats']).toHaveLength(2);
    expect(room.published['player-stats'].at(-1)).toEqual({
      p1: { ping: 42, volume: 0.01 },
      p2: { ping: 99, volume: 0.02 },
    });
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
    await expect(room.handlers.selection.setChart.handler(ctx('p1'), manifest, corrupted, 2)).rejects.toThrow();
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

  it('resets readiness when the host selects a new song', async () => {
    const room = createRoom();
    join(room, ['p1', 'p2']);
    await uploadChart(room);
    await room.handlers.room.setReady.handler(ctx('p2'), true);
    expect(room.logic.getState().participants.find((participant) => participant.id === 'p2')?.ready).toBe(true);

    await uploadChart(room); // select again
    const state = room.logic.getState();
    expect(state.participants.every((participant) => !participant.ready)).toBe(true);
    expect(state.participants.every((participant) => participant.probe === 'unknown')).toBe(true);
  });
});

describe('readiness, probing and countdown', () => {
  it('starts probing once everyone is ready and counts down once everyone is playable', async () => {
    const room = createRoom();
    join(room, ['p1', 'p2']);
    await uploadChart(room);

    await room.handlers.room.setReady.handler(ctx('p1'), true);
    expect(room.logic.getState().probeDeadline).toBeNull();

    await room.handlers.room.setReady.handler(ctx('p2'), true);
    const probing = room.logic.getState();
    expect(probing.probeDeadline).not.toBeNull();
    expect(probing.participants.every((participant) => participant.probe === 'pending')).toBe(true);

    await room.handlers.room.reportProbe.handler(ctx('p1'), true);
    expect(room.logic.getState().phase).toBe('lobby');

    await room.handlers.room.reportProbe.handler(ctx('p2'), true);
    const state = room.logic.getState();
    expect(state.phase).toBe('countdown');
    expect(state.countdownEndsAt).toBe(Date.now() + ONLINE_COUNTDOWN_MS);

    vi.advanceTimersByTime(ONLINE_COUNTDOWN_MS);
    const singing = room.logic.getState();
    expect(singing.phase).toBe('singing');
    expect(singing.playbackAnchor).toEqual({ serverTimeMs: Date.now(), videoTimeMs: 0 });
  });

  it('does not start when a singer fails the probe, and surfaces it in the lobby', async () => {
    const room = createRoom();
    join(room, ['p1', 'p2']);
    await uploadChart(room);
    await room.handlers.room.setReady.handler(ctx('p1'), true);
    await room.handlers.room.setReady.handler(ctx('p2'), true);
    await room.handlers.room.reportProbe.handler(ctx('p1'), true);
    await room.handlers.room.reportProbe.handler(ctx('p2'), false);

    const state = room.logic.getState();
    expect(state.phase).toBe('lobby');
    const failed = state.participants.find((participant) => participant.id === 'p2');
    expect(failed?.probe).toBe('failed');
    expect(failed?.ready).toBe(false);
  });

  it('fails singers that never respond to the probe within the timeout', async () => {
    const room = createRoom();
    join(room, ['p1', 'p2']);
    await uploadChart(room);
    await room.handlers.room.setReady.handler(ctx('p1'), true);
    await room.handlers.room.setReady.handler(ctx('p2'), true);
    await room.handlers.room.reportProbe.handler(ctx('p1'), true);

    vi.advanceTimersByTime(ONLINE_PROBE_TIMEOUT_MS);
    const state = room.logic.getState();
    expect(state.phase).toBe('lobby');
    expect(state.probeDeadline).toBeNull();
    expect(state.participants.find((participant) => participant.id === 'p2')?.probe).toBe('failed');
  });

  it('requires re-confirmation when a new singer joins during probing', async () => {
    const room = createRoom();
    join(room, ['p1', 'p2']);
    await uploadChart(room);
    await room.handlers.room.setReady.handler(ctx('p1'), true);
    await room.handlers.room.setReady.handler(ctx('p2'), true);
    expect(room.logic.getState().probeDeadline).not.toBeNull();

    join(room, ['p3']);
    const state = room.logic.getState();
    expect(state.probeDeadline).toBeNull();
    expect(state.phase).toBe('lobby');
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

    const detailed = [{ normal: 100 }, { normal: 200 }] as never;
    await room.handlers.scoring.publishFinal.handler(ctx('p1'), detailed);
    await room.handlers.scoring.publishFinal.handler(ctx('p2'), detailed);

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

    const detailed = [{ normal: 100 }, { normal: 200 }] as never;
    await room.handlers.scoring.publishFinal.handler(ctx('p1'), detailed);
    expect(room.logic.getState().phase).toBe('singing');

    await room.handlers.scoring.publishFinal.handler(ctx('p2'), detailed);
    const state = room.logic.getState();
    expect(state.phase).toBe('results');
    expect(state.finalResults).toHaveLength(2);
  });

  it('does not wait for singers that disconnected mid-song (after grace)', async () => {
    const room = createRoom();
    join(room, ['p1', 'p2']);
    await startSinging(room, ['p1', 'p2']);

    const detailed = [{ normal: 100 }, { normal: 200 }] as never;
    await room.handlers.scoring.publishFinal.handler(ctx('p1'), detailed);
    room.logic.handleDisconnect('p2');
    vi.advanceTimersByTime(ONLINE_RECONNECT_GRACE_MS);

    expect(room.logic.getState().phase).toBe('results');
  });

  it('returns to the lobby for another song', async () => {
    const room = createRoom();
    join(room, ['p1', 'p2']);
    await startSinging(room, ['p1', 'p2']);
    const detailed = [{ normal: 100 }, { normal: 200 }] as never;
    await room.handlers.scoring.publishFinal.handler(ctx('p1'), detailed);
    await room.handlers.scoring.publishFinal.handler(ctx('p2'), detailed);

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
    expect(room.scheduleTtl).toHaveBeenCalledWith(Date.now() + ONLINE_ROOM_TTL_MS);
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
