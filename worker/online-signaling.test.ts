import { afterEach, describe, expect, it, vi } from 'vitest';

import { IceServersResponse } from '../src/modules/online/signaling/protocol';
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
