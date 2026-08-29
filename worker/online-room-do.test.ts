import { reset } from 'cloudflare:test';
import { env as workerEnv } from 'cloudflare:workers';
import { afterEach, describe, expect, it } from 'vitest';

import type { OnlineRoom } from './online-room-do';

let roomCounter = 0;
const getRoom = () => {
  const namespace = workerEnv.ONLINE_ROOM as DurableObjectNamespace<OnlineRoom>;
  return namespace.get(namespace.idFromName(`server-room-${(roomCounter += 1)}`));
};

/** Opens a client socket to the room the way the Worker's `/online/server/:code` route does. */
const connect = async (
  room: DurableObjectStub<OnlineRoom>,
  participantId: string,
  { name = 'Singer', create = false } = {},
) => {
  const url = new URL('https://example.test/online/server/abcde');
  url.searchParams.set('code', 'abcde');
  url.searchParams.set('pid', participantId);
  url.searchParams.set('name', name);
  if (create) url.searchParams.set('create', '1');

  const response = await room.fetch(new Request(url, { headers: { Upgrade: 'websocket' } }));
  const socket = response.webSocket!;
  const received: Array<Record<string, unknown>> = [];
  socket.accept();
  socket.addEventListener('message', (event) => received.push(JSON.parse(event.data as string)));
  return { socket, received, status: response.status };
};

const settle = () => new Promise((resolve) => setTimeout(resolve, 50));

afterEach(async () => {
  await reset();
});

describe('OnlineRoom (server-authoritative)', () => {
  it('refuses a room code nobody opened', async () => {
    const room = getRoom();

    const { received } = await connect(room, 'p1');
    await settle();

    expect(received).toContainEqual({ t: 'join-rejected', reason: 'not-found' });
    expect(await room.isCreated()).toBe(false);
  });

  it('admits the participant that opens the room and reports it as created', async () => {
    const room = getRoom();

    const { received } = await connect(room, 'p1', { name: 'Host', create: true });
    await settle();

    const joined = received.find((message) => message.t === 'joined') as { state: { participants: unknown[] } };
    expect(joined).toBeDefined();
    expect(joined.state.participants).toHaveLength(1);
    expect(await room.isCreated()).toBe(true);
  });

  it('runs the same room logic as the browser host — a second singer shows up in the state', async () => {
    const room = getRoom();
    await connect(room, 'p1', { name: 'Host', create: true });
    await settle();

    const { received } = await connect(room, 'p2', { name: 'Guest' });
    await settle();

    const joined = received.find((message) => message.t === 'joined') as {
      state: { participants: Array<{ name: string }> };
    };
    expect(joined.state.participants.map((participant) => participant.name)).toEqual(['Host', 'Guest']);
  });

  it('answers a ping so the client can measure latency', async () => {
    const room = getRoom();
    const { socket, received } = await connect(room, 'p1', { create: true });
    await settle();

    socket.send(JSON.stringify({ t: 'ping' }));
    await settle();

    expect(received).toContainEqual({ t: 'pong' });
  });

  it('replays the current value when a client subscribes to a channel', async () => {
    const room = getRoom();
    const { socket, received } = await connect(room, 'p1', { create: true });
    await settle();

    socket.send(JSON.stringify({ t: 'rpc-sub', channel: 'room-state' }));
    await settle();

    // The fallback means a subscriber gets the room's state without waiting for the next change.
    expect(received.some((message) => message.t === 'rpc-pub' && message.channel === 'room-state')).toBe(true);
  });

  it('dispatches RPC calls against the room logic', async () => {
    const room = getRoom();
    const { socket, received } = await connect(room, 'p1', { name: 'Before', create: true });
    // State pushes only reach subscribers, so the rename is only observable after subscribing.
    socket.send(JSON.stringify({ t: 'rpc-sub', channel: 'room-state' }));
    await settle();

    socket.send(JSON.stringify({ t: 'rpc', ns: 'room', method: 'setName', args: ['After'], id: 'call-1' }));
    await settle();

    expect(received.filter((message) => message.t === 'rpc-res').map((message) => message.id)).toEqual(['call-1']);
    const published = received.filter((message) => message.t === 'rpc-pub') as Array<{
      data: { participants: Array<{ name: string }> };
    }>;
    expect(published.at(-1)?.data.participants[0].name).toBe('After');
  });

  it('ignores a malformed frame instead of failing the socket', async () => {
    const room = getRoom();
    const { socket, received } = await connect(room, 'p1', { create: true });
    await settle();

    socket.send('not json at all');
    socket.send(JSON.stringify({ t: 'ping' }));
    await settle();

    expect(received).toContainEqual({ t: 'pong' });
  });
});
