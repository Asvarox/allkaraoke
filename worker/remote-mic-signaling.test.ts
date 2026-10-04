import { afterEach, describe, expect, it, vi } from 'vitest';

import { ChannelAuthorization } from '../src/modules/network/realtime/protocol';
import { handleRemoteMicSignaling, RemoteMicSignalingEnv } from './remote-mic-signaling';

// The endpoints are shared with online mode and covered by online-signaling.test.ts; this covers
// only what the remote-mic mount does differently.

const envWith = (auth: ChannelAuthorization): RemoteMicSignalingEnv =>
  ({
    REALTIME_APP_ID: 'app',
    REALTIME_APP_TOKEN: 'token',
    REMOTE_MIC_DIRECTORY: {
      idFromName: () => 'id',
      get: () => ({ authorize: async () => auth }),
    },
  }) as unknown as RemoteMicSignalingEnv;

const echoChannels = async (_url: string, init: RequestInit) => {
  const { dataChannels } = JSON.parse(init.body as string) as { dataChannels: Array<{ dataChannelName: string }> };
  return Response.json({
    dataChannels: dataChannels.map(({ dataChannelName }, id) => ({ dataChannelName, id: id + 1 })),
  });
};

const createChannels = async (env: RemoteMicSignalingEnv, roomCode: string, channels: unknown[]) => {
  const path = '/remote-mic-signaling/datachannels';
  const request = new Request(`https://example.test${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ roomCode, participantId: 'game', sessionId: 's1', channels }),
  });
  return (await handleRemoteMicSignaling(request, env, path))!;
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('remote-mic signaling', () => {
  const game: ChannelAuthorization = { ok: true, isHost: true, slot: 0, hostSessionId: 's1' };

  it('lets the game publish a slot for every phone, and no more', async () => {
    vi.stubGlobal('fetch', vi.fn(echoChannels));

    expect((await createChannels(envWith(game), 'rabcd', [{ name: 'slot-15' }])).status).toBe(200);
    expect((await createChannels(envWith(game), 'rabcd', [{ name: 'slot-16' }])).status).toBe(403);
  });

  it('only serves Realtime game codes', async () => {
    // An online room code belongs to the other directory; PartyKit codes never reach one
    expect((await createChannels(envWith(game), '2abcd', [{ name: 'room' }])).status).toBe(400);
    expect((await createChannels(envWith(game), 'kabcd', [{ name: 'room' }])).status).toBe(400);
  });

  it('leaves online mode’s paths alone', async () => {
    const request = new Request('https://example.test/online/ice');

    expect(await handleRemoteMicSignaling(request, envWith(game), '/online/ice')).toBeNull();
  });
});
