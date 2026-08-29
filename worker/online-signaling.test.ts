import { afterEach, describe, expect, it, vi } from 'vitest';

import { ChannelAuthorization, IceServersResponse } from '../src/modules/online/signaling/protocol';
import { handleOnlineSignaling, OnlineSignalingEnv } from './online-signaling';

// Enough of the env to get past the "online mode is not configured" guard; the ICE endpoint never
// reaches the directory.
const baseEnv = { ONLINE_DIRECTORY: {} } as unknown as OnlineSignalingEnv;

const getIceServers = async (env: Partial<OnlineSignalingEnv>): Promise<IceServersResponse> => {
  const request = new Request('https://example.test/online/ice');
  const response = await handleOnlineSignaling(request, { ...baseEnv, ...env }, '/online/ice');
  expect(response?.status).toBe(200);
  return (await response!.json()) as IceServersResponse;
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('ICE servers', () => {
  it('serves STUN with nothing configured at all', async () => {
    // The point of this one: a checkout with no Cloudflare credentials of any kind still gets
    // something a browser can connect with, because STUN is unauthenticated.
    const { iceServers } = await getIceServers({});

    expect(iceServers).toHaveLength(1);
    expect(iceServers[0].urls[0]).toContain('stun:');
    expect(iceServers[0].username).toBeUndefined();
  });

  it('offers no TURN until a deployment opts into one', async () => {
    const { iceServers } = await getIceServers({});

    expect(iceServers.flatMap((server) => server.urls).some((url) => url.startsWith('turn'))).toBe(false);
  });

  it('lets the STUN servers be pointed somewhere other than Cloudflare', async () => {
    const { iceServers } = await getIceServers({
      ONLINE_STUN_URLS: 'stun:stun.example.test:3478, stun:other.test:3478',
    });

    expect(iceServers[0].urls).toEqual(['stun:stun.example.test:3478', 'stun:other.test:3478']);
  });

  it('adds a static TURN server alongside STUN when one is configured', async () => {
    const { iceServers } = await getIceServers({
      ONLINE_TURN_URLS: 'turn:turn.example.test:3478?transport=udp',
      ONLINE_TURN_USERNAME: 'user',
      ONLINE_TURN_CREDENTIAL: 'secret',
    });

    expect(iceServers).toHaveLength(2);
    expect(iceServers[1]).toEqual({
      urls: ['turn:turn.example.test:3478?transport=udp'],
      username: 'user',
      credential: 'secret',
    });
  });

  it('mints short-lived credentials when Cloudflare Realtime TURN keys are configured', async () => {
    const minted = {
      iceServers: [
        { urls: ['stun:stun.cloudflare.com:3478'] },
        { urls: ['turn:turn.cloudflare.com:3478?transport=udp'], username: 'u', credential: 'c' },
      ],
    };
    const fetchMock = vi.fn(async () => new Response(JSON.stringify(minted), { status: 201 }));
    vi.stubGlobal('fetch', fetchMock);

    const result = await getIceServers({
      REALTIME_TURN_KEY_ID: 'key-id',
      REALTIME_TURN_API_TOKEN: 'api-token',
    });

    expect(result.iceServers).toEqual(minted.iceServers);
    expect(result.ttlSeconds).toBeGreaterThan(0);
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe('https://rtc.live.cloudflare.com/v1/turn/keys/key-id/credentials/generate-ice-servers');
    expect((init.headers as Record<string, string>).Authorization).toBe('Bearer api-token');
  });

  it('falls back to STUN when minting fails rather than failing the join', async () => {
    // TURN only matters for the minority of networks that need it — losing it must not stop
    // everybody else from getting into a room.
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response('nope', { status: 500 })),
    );

    const { iceServers } = await getIceServers({
      REALTIME_TURN_KEY_ID: 'key-id-2',
      REALTIME_TURN_API_TOKEN: 'api-token',
    });

    expect(iceServers).toHaveLength(1);
    expect(iceServers[0].urls[0]).toContain('stun:');
  });
});

/**
 * Channel creation is the one place a room code alone could have bought access to another singer's
 * slot. Cloudflare grants reply access to a single subscriber at a time, so claiming somebody
 * else's slot would not just eavesdrop — it would cut off the rightful occupant.
 */
describe('data channel authorisation', () => {
  const HOST_SESSION = 'host-session';

  const envWith = (auth: ChannelAuthorization): OnlineSignalingEnv =>
    ({
      REALTIME_APP_ID: 'app',
      REALTIME_APP_TOKEN: 'token',
      ONLINE_DIRECTORY: {
        idFromName: () => 'id',
        get: () => ({ authorize: async () => auth }),
      },
    }) as unknown as OnlineSignalingEnv;

  const createChannels = async (auth: ChannelAuthorization, channels: unknown[]) => {
    const request = new Request('https://example.test/online/datachannels', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roomCode: 'abcde', participantId: 'p2', sessionId: 's2', channels }),
    });
    return (await handleOnlineSignaling(request, envWith(auth), '/online/datachannels'))!;
  };

  const member: ChannelAuthorization = { ok: true, isHost: false, slot: 2, hostSessionId: HOST_SESSION };

  it('turns away a session the directory does not know', async () => {
    const response = await createChannels({ ok: false }, [
      { name: 'slot-2', publisherSessionId: HOST_SESSION, canReply: true },
    ]);

    expect(response.status).toBe(403);
  });

  it('refuses a member the reply path on somebody else’s slot', async () => {
    const response = await createChannels(member, [
      { name: 'slot-4', publisherSessionId: HOST_SESSION, canReply: true },
    ]);

    expect(response.status).toBe(403);
  });

  it('refuses a member the reply path on the broadcast channel', async () => {
    const response = await createChannels(member, [{ name: 'room', publisherSessionId: HOST_SESSION, canReply: true }]);

    expect(response.status).toBe(403);
  });

  it('refuses a member publishing its own channels', async () => {
    const response = await createChannels(member, [{ name: 'room' }]);

    expect(response.status).toBe(403);
  });

  it('refuses a subscription pointed at a session that is not the host', async () => {
    const response = await createChannels(member, [
      { name: 'slot-2', publisherSessionId: 'someone-elses-session', canReply: true },
    ]);

    expect(response.status).toBe(403);
  });

  it('allows a member its own slot and the read-only broadcast', async () => {
    const fetchMock = vi.fn(
      async () => new Response(JSON.stringify({ dataChannels: [{ dataChannelName: 'room', id: 1 }] }), { status: 200 }),
    );
    vi.stubGlobal('fetch', fetchMock);

    const response = await createChannels(member, [
      { name: 'room', publisherSessionId: HOST_SESSION },
      { name: 'slot-2', publisherSessionId: HOST_SESSION, canReply: true },
    ]);

    expect(response.status).toBe(200);
    expect(fetchMock).toHaveBeenCalled();
  });

  it('allows the host to publish the broadcast and every slot', async () => {
    const fetchMock = vi.fn(
      async () => new Response(JSON.stringify({ dataChannels: [{ dataChannelName: 'room', id: 1 }] }), { status: 200 }),
    );
    vi.stubGlobal('fetch', fetchMock);

    const response = await createChannels({ ok: true, isHost: true, slot: 0, hostSessionId: HOST_SESSION }, [
      { name: 'room' },
      { name: 'slot-0' },
      { name: 'slot-5' },
    ]);

    expect(response.status).toBe(200);
  });

  it('refuses the host subscribing to anything', async () => {
    const response = await createChannels({ ok: true, isHost: true, slot: 0, hostSessionId: HOST_SESSION }, [
      { name: 'slot-3', publisherSessionId: 'another-session' },
    ]);

    expect(response.status).toBe(403);
  });
});
