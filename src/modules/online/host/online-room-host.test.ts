import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { OnlineRoomChannels, SfuRoomMembership } from '~/modules/online/client/transport/interface';
import { OnlineHostSnapshot, OnlineRoomHost } from '~/modules/online/host/online-room-host';
import {
  ONLINE_HOST_HEARTBEAT_MS,
  ONLINE_RECONNECT_GRACE_MS,
  ONLINE_SNAPSHOT_BROADCAST_MS,
} from '~/modules/online/protocol/consts';
import { OnlineMessages, OnlineRoomState } from '~/modules/online/protocol/types';

/**
 * Stands in for the SFU. The host publishes one broadcast that lands on every connected slot, and
 * each slot is a private duplex pipe — which is the whole contract the host runtime relies on.
 */
const createFabric = () => {
  const messageListeners = new Set<(message: OnlineMessages, slot: number | null) => void>();
  const closeListeners = new Set<(slot: number) => void>();
  const slots = new Map<number, OnlineMessages[]>();
  const broadcasts: OnlineMessages[] = [];
  const released: string[] = [];

  const channels: OnlineRoomChannels = {
    broadcast: (message) => {
      broadcasts.push(message);
      slots.forEach((received) => received.push(message));
    },
    sendToSlot: (slot, message) => slots.get(slot)?.push(message),
    onMessage: (listener) => {
      messageListeners.add(listener);
      return () => messageListeners.delete(listener);
    },
    onSlotClosed: (listener) => {
      closeListeners.add(listener);
      return () => closeListeners.delete(listener);
    },
    getMembership: () => membership,
    getSessionId: () => 'host-session',
    isConnected: () => true,
    keepalive: () => Promise.resolve(),
    leave: () => Promise.resolve(),
    releaseSlot: (participantId, ban) => {
      released.push(ban ? `${participantId}:banned` : participantId);
      return Promise.resolve();
    },
  };

  const membership: SfuRoomMembership = { isHost: true, hostSessionId: 'host-session', epoch: 1, slot: 0 };

  return {
    channels,
    membership,
    broadcasts,
    released,
    connect: (slot: number) => {
      const received: OnlineMessages[] = [];
      slots.set(slot, received);
      return {
        received,
        send: (message: OnlineMessages) => messageListeners.forEach((listener) => listener(message, slot)),
        drop: () => {
          slots.delete(slot);
          closeListeners.forEach((listener) => listener(slot));
        },
      };
    },
  };
};

const hello = (participantId: string, name: string, create = false): OnlineMessages => ({
  t: 'hello',
  participantId,
  name,
  create,
});

const lastState = (messages: OnlineMessages[]): OnlineRoomState | undefined => {
  const published = messages.filter((message) => message.t === 'rpc-pub' && message.channel === 'room-state') as Array<{
    data: OnlineRoomState;
  }>;
  return published.at(-1)?.data;
};

const joinedState = (messages: OnlineMessages[]): OnlineRoomState | undefined =>
  (messages.find((message) => (message as { t: string }).t === 'joined') as { state: OnlineRoomState } | undefined)
    ?.state;

let fabric: ReturnType<typeof createFabric>;
let host: OnlineRoomHost;

const startHost = (restoreFrom: OnlineHostSnapshot | null = null) => {
  fabric = createFabric();
  host = new OnlineRoomHost({
    roomCode: 'testr',
    participantId: 'host-participant',
    connection: fabric.channels,
    membership: fabric.membership,
    restoreFrom,
  });
  return host;
};

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  host?.close();
  vi.useRealTimers();
});

describe('OnlineRoomHost', () => {
  it('accepts a hello and answers on that participant’s own slot', async () => {
    startHost();
    const peer = fabric.connect(1);

    peer.send(hello('p2', 'Singer'));
    await vi.advanceTimersByTimeAsync(0);

    expect(joinedState(peer.received)?.participants.map((participant) => participant.id)).toContain('p2');
  });

  it('binds a slot to whoever said hello on it, so later RPCs are attributed to them', async () => {
    startHost();
    const peer = fabric.connect(1);
    peer.send(hello('p2', 'Singer'));
    await vi.advanceTimersByTimeAsync(0);

    peer.send({ t: 'rpc', ns: 'room', method: 'setName', args: ['Renamed'], id: 'call-1' });
    await vi.advanceTimersByTimeAsync(0);

    const renamed = lastState(peer.received)?.participants.find((participant) => participant.id === 'p2');
    expect(renamed?.name).toBe('Renamed');
  });

  it('publishes state once for the whole room rather than once per singer', async () => {
    startHost();
    const first = fabric.connect(1);
    const second = fabric.connect(2);
    first.send(hello('p2', 'A'));
    second.send(hello('p3', 'B'));
    await vi.advanceTimersByTimeAsync(0);
    const before = fabric.broadcasts.filter((message) => message.t === 'rpc-pub').length;

    first.send({ t: 'rpc', ns: 'room', method: 'setName', args: ['Renamed'], id: 'call-1' });
    await vi.advanceTimersByTimeAsync(0);

    // One publish reached both singers — the host's uplink does not grow with the room.
    expect(fabric.broadcasts.filter((message) => message.t === 'rpc-pub').length).toBe(before + 1);
    expect(lastState(first.received)).toEqual(lastState(second.received));
  });

  it('rejects a hello for a room that is already full without giving away a slot', async () => {
    startHost();
    // The host itself is a participant, so ONLINE_MAX_PLAYERS - 1 more fill the room.
    for (let i = 1; i < 6; i++) {
      fabric.connect(i).send(hello(`p${i}`, `Singer ${i}`));
    }
    await vi.advanceTimersByTimeAsync(0);

    const latecomer = fabric.connect(6);
    latecomer.send(hello('too-many', 'Latecomer'));
    await vi.advanceTimersByTimeAsync(0);

    expect(latecomer.received).toContainEqual({ t: 'join-rejected', reason: 'room-full' });
    // Rejecting them must also hand back the directory slot they claimed on the way in, or a full
    // room loses the very seat it just refused.
    expect(fabric.released).toContain('too-many');
  });

  it('starts the reconnect grace window when a slot channel closes', async () => {
    startHost();
    const peer = fabric.connect(1);
    peer.send(hello('p2', 'Singer'));
    await vi.advanceTimersByTimeAsync(0);

    peer.drop();
    await vi.advanceTimersByTimeAsync(0);

    const state = lastState(fabric.broadcasts);
    expect(state?.participants.find((participant) => participant.id === 'p2')?.connected).toBe(false);
  });

  it('drops a participant whose grace window runs out, driven by a plain timer', async () => {
    startHost();
    const peer = fabric.connect(1);
    peer.send(hello('p2', 'Singer'));
    await vi.advanceTimersByTimeAsync(0);
    peer.drop();

    // No Durable Object alarm any more — this is `setTimeout` in the host's own tab.
    await vi.advanceTimersByTimeAsync(ONLINE_RECONNECT_GRACE_MS + 100);

    expect(lastState(fabric.broadcasts)?.participants.map((participant) => participant.id)).not.toContain('p2');
  });

  it('frees the directory slot of a singer whose grace window expired', async () => {
    startHost();
    const peer = fabric.connect(1);
    peer.send(hello('p2', 'Singer'));
    await vi.advanceTimersByTimeAsync(0);
    peer.drop();

    // The room logic drops them on its own timer and cannot reach the directory itself, so the
    // host has to notice — otherwise the slot stays claimed and a busy room turns people away.
    await vi.advanceTimersByTimeAsync(ONLINE_RECONNECT_GRACE_MS + ONLINE_SNAPSHOT_BROADCAST_MS + 100);

    expect(fabric.released).toContain('p2');
  });

  it('broadcasts a heartbeat carrying the current epoch', async () => {
    startHost();

    await vi.advanceTimersByTimeAsync(ONLINE_HOST_HEARTBEAT_MS + 10);

    expect(fabric.broadcasts).toContainEqual({ t: 'hb', epoch: 1 });
  });

  it('leaves the chart out of the snapshot it broadcasts for the succession line', async () => {
    startHost();
    const peer = fabric.connect(1);
    peer.send(hello('p2', 'Singer'));

    await vi.advanceTimersByTimeAsync(ONLINE_SNAPSHOT_BROADCAST_MS + 10);

    const snapshot = fabric.broadcasts.filter((message) => message.t === 'snapshot').at(-1) as
      | { state: Record<string, unknown> }
      | undefined;
    expect(snapshot).toBeDefined();
    expect(snapshot!.state).not.toHaveProperty('chartData');
    expect(snapshot!.state.participants).toBeDefined();
  });
});

describe('OnlineRoomHost takeover', () => {
  it('resumes the room from the previous host’s snapshot instead of restarting it', async () => {
    // What a successor holds: the last snapshot it saw broadcast, with the singers that were in
    // the room at the time.
    const snapshot = {
      roomCode: 'testr',
      participants: [
        {
          id: 'old-host',
          name: 'A',
          joinOrder: 0,
          playerNumber: 0,
          connected: false,
          ready: false,
          graceDeadline: null,
        },
        {
          id: 'successor',
          name: 'B',
          joinOrder: 1,
          playerNumber: 1,
          connected: true,
          ready: false,
          graceDeadline: null,
        },
      ],
      nextJoinOrder: 2,
      hostId: 'old-host',
      tolerance: 2,
      phase: 'lobby',
      chart: null,
      chartPreview: null,
      leaderboard: [],
      finalResults: null,
      lastActivityAt: Date.now(),
      bannedIds: [],
      created: true,
      readinessDeadline: null,
      playbackAnchor: null,
      pause: null,
      resumeCountdownEndsAt: null,
      finishRequestedAt: null,
    } as unknown as OnlineHostSnapshot;

    fabric = createFabric();
    host = new OnlineRoomHost({
      roomCode: 'testr',
      participantId: 'successor',
      connection: fabric.channels,
      membership: { ...fabric.membership, epoch: 2 },
      restoreFrom: snapshot,
    });
    await vi.advanceTimersByTimeAsync(0);

    const state = lastState(fabric.broadcasts) ?? undefined;
    // Everyone who was in the room is still in it, and the successor is now the one in charge.
    expect(state?.participants.map((participant) => participant.id).sort()).toEqual(['old-host', 'successor']);
    expect(state?.hostId).toBe('successor');
    expect(state?.hostEpoch).toBe(2);
  });
});
