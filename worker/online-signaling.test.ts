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
      body: JSON.stringify({ roomCode: '2abcd', participantId: 'p2', sessionId: 's2', channels }),
    });
    return (await handleOnlineSignaling(request, envWith(auth), '/online/datachannels'))!;
  };

  const member: ChannelAuthorization = { ok: true, isHost: false, slot: 2, hostSessionId: HOST_SESSION };

  /** Answers `datachannels/new` the way the real API does: one result per requested channel. */
  const echoChannels = async (_url: string, init: RequestInit) => {
    const { dataChannels } = JSON.parse(init.body as string) as { dataChannels: Array<{ dataChannelName: string }> };
    return Response.json({
      dataChannels: dataChannels.map(({ dataChannelName }, id) => ({ dataChannelName, id: id + 1 })),
    });
  };

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
    const fetchMock = vi.fn(echoChannels);
    vi.stubGlobal('fetch', fetchMock);

    const response = await createChannels(member, [
      { name: 'room', publisherSessionId: HOST_SESSION },
      { name: 'slot-2', publisherSessionId: HOST_SESSION, canReply: true },
    ]);

    expect(response.status).toBe(200);
    expect(fetchMock).toHaveBeenCalled();
  });

  it('allows the host to publish the broadcast and every slot', async () => {
    const fetchMock = vi.fn(echoChannels);
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

describe('abuse limits', () => {
  const realtimeEnv = {
    REALTIME_APP_ID: 'app',
    REALTIME_APP_TOKEN: 'token',
    ONLINE_DIRECTORY: {},
  } as unknown as OnlineSignalingEnv;

  const createSession = (env: OnlineSignalingEnv) => {
    const request = new Request('https://example.test/online/session', {
      method: 'POST',
      headers: { 'CF-Connecting-IP': '203.0.113.9' },
    });
    return handleOnlineSignaling(request, env, '/online/session');
  };

  it('turns away a caller that has run out of budget on the paid endpoints', async () => {
    // `/online/session` takes no input at all and spends our Realtime app token, so without a
    // limit any page anywhere could open sessions on it for as long as it liked.
    const response = await createSession({
      ...realtimeEnv,
      ONLINE_SIGNALING_RATE_LIMITER: { limit: async () => ({ success: false }) },
    });

    expect(response?.status).toBe(429);
  });

  it('runs with no limiter bound at all', async () => {
    // Absent locally and under e2e. Failing closed there would take online mode down on every
    // checkout, and there is no Realtime app to spend anything on in the first place.
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string) =>
        Response.json(
          url.includes('/sessions/new')
            ? { sessionId: 'created' }
            : { sessionDescription: { type: 'offer', sdp: 'v=0' }, requiresImmediateRenegotiation: true },
        ),
      ),
    );

    const response = await createSession(realtimeEnv);

    expect(response?.status).toBe(200);
  });
});

describe('cross-origin access', () => {
  const ice = (origin?: string) =>
    handleOnlineSignaling(
      new Request('https://allkaraoke.party/online/ice', origin ? { headers: { Origin: origin } } : undefined),
      { ONLINE_DIRECTORY: {} } as unknown as OnlineSignalingEnv,
      '/online/ice',
    );

  it('answers its own origin and a local checkout', async () => {
    expect((await ice('https://allkaraoke.party'))?.headers.get('Access-Control-Allow-Origin')).toBe(
      'https://allkaraoke.party',
    );
    // A build pointed at another deployment with VITE_APP_SIGNALING_URL — the one real cross-origin
    // caller these endpoints have.
    expect((await ice('http://localhost:3000'))?.headers.get('Access-Control-Allow-Origin')).toBe(
      'http://localhost:3000',
    );
  });

  it('does not hand every page on the internet a browser-side client', async () => {
    expect((await ice('https://not-ours.example'))?.headers.get('Access-Control-Allow-Origin')).toBeNull();
  });
});

describe('room codes', () => {
  it('turns away a code that belongs to PartyKit, so no room can exist in both backends', async () => {
    const env = { ONLINE_DIRECTORY: {} } as unknown as OnlineSignalingEnv;
    const lookup = (code: string) =>
      handleOnlineSignaling(new Request(`https://example.test/online/room/${code}`), env, `/online/room/${code}`);

    // An all-letter code is a server-mode room; the directory must never answer for one, or an
    // out-of-date client could open a P2P room under a code everyone else looks for in PartyKit.
    expect((await lookup('abcde'))?.status).toBe(400);
    expect((await lookup('1abcd'))?.status).toBe(400);
  });
});

describe('Realtime API handshake', () => {
  const realtimeEnv = {
    REALTIME_APP_ID: 'app',
    REALTIME_APP_TOKEN: 'token',
    ONLINE_DIRECTORY: {},
  } as unknown as OnlineSignalingEnv;

  interface RecordedCall {
    url: string;
    method: string;
    body: unknown;
    contentType: string | null;
  }

  /** Stands in for Cloudflare's Realtime API, answering the way the real one does, and records
   * exactly what it was sent — the stubs used to accept anything, which is how two request-shape
   * bugs reached production. */
  const stubRealtime = (answers: Record<string, unknown> = {}) => {
    const calls: RecordedCall[] = [];
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string, init: RequestInit) => {
        calls.push({
          url,
          method: init.method ?? 'GET',
          body: typeof init.body === 'string' ? JSON.parse(init.body) : init.body,
          contentType: new Headers(init.headers).get('Content-Type'),
        });
        const matched = Object.keys(answers).find((suffix) => url.endsWith(suffix));
        if (matched) return Response.json(answers[matched]);
        if (url.endsWith('/sessions/new')) return Response.json({ sessionId: 'created' });
        if (url.endsWith('/datachannels/establish')) {
          return Response.json({
            sessionDescription: { type: 'offer', sdp: 'v=0 sfu offer' },
            requiresImmediateRenegotiation: true,
            dataChannel: { location: 'remote', dataChannelName: 'server-events', id: 0 },
          });
        }
        return Response.json({});
      }),
    );
    return calls;
  };

  const post = (path: string, body?: unknown) =>
    handleOnlineSignaling(
      new Request(`https://example.test${path}`, {
        method: 'POST',
        ...(body === undefined ? {} : { headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }),
      }),
      realtimeEnv,
      path,
    );

  const openSession = async () =>
    (await (await post('/online/session'))!.json()) as {
      sessionId: string;
      offer: { type: string; sdp: string };
      answerToken: string;
    };

  it('opens a session with no body, then has the SFU make the offer', async () => {
    const calls = stubRealtime();

    const response = await post('/online/session');

    expect(response?.status).toBe(200);
    const [created, established] = calls;
    // `sessions/new` takes no body: production answered `{}` with "Body JSON validation error".
    expect(created).toMatchObject({ method: 'POST', body: undefined, contentType: null });
    expect(created.url).toMatch(/\/apps\/app\/sessions\/new$/);
    // `establish` takes no SDP — the browser's offer sent here was refused with "Failed to decode
    // body as JSON". Cloudflare's own data-channel example sends exactly this.
    expect(established.url).toMatch(/\/sessions\/created\/datachannels\/establish$/);
    expect(established.body).toEqual({ dataChannel: { location: 'remote', dataChannelName: 'server-events' } });
    expect(await response!.json()).toMatchObject({
      sessionId: 'created',
      offer: { type: 'offer', sdp: 'v=0 sfu offer' },
      answerToken: expect.any(String),
    });
  });

  it("completes the transport with the browser's answer", async () => {
    const calls = stubRealtime();
    const { sessionId, answerToken } = await openSession();

    const response = await post('/online/session/answer', {
      sessionId,
      answer: { type: 'answer', sdp: 'v=0 browser answer' },
      answerToken,
    });

    expect(response?.status).toBe(200);
    expect(calls.at(-1)).toMatchObject({
      method: 'PUT',
      body: { sessionDescription: { type: 'answer', sdp: 'v=0 browser answer' } },
    });
    expect(calls.at(-1)!.url).toMatch(/\/sessions\/created\/renegotiate$/);
  });

  it('refuses to renegotiate a session for anybody but the browser that opened it', async () => {
    // Session ids are public — a room's host session id is handed to anyone who asks for the room —
    // so an id alone must not be enough to swap somebody else's transport for an answer of your own.
    const calls = stubRealtime();
    const { sessionId, answerToken } = await openSession();
    const other = await openSession();
    const before = calls.length;
    const answer = { type: 'answer', sdp: 'v=0 hijack' };

    expect((await post('/online/session/answer', { sessionId, answer }))?.status).toBe(403);
    expect((await post('/online/session/answer', { sessionId, answer, answerToken: 'forged' }))?.status).toBe(403);
    // A genuine token, but for a different session.
    expect((await post('/online/session/answer', { sessionId, answer, answerToken: `${answerToken}x` }))?.status).toBe(
      403,
    );
    expect(
      (await post('/online/session/answer', { sessionId: 'someone-else', answer, answerToken: other.answerToken }))
        ?.status,
    ).toBe(403);
    expect(calls.length).toBe(before);
  });

  it("puts Cloudflare's reason in the log when it refuses a channel inside a 200", async () => {
    // Each channel succeeds or fails on its own; a refused one is an item with an errorCode and no
    // id, which the browser would otherwise only discover as a negotiated channel with no id.
    stubRealtime({
      '/datachannels/new': { dataChannels: [{ errorCode: 'not_found', errorDescription: 'no such publisher' }] },
    });
    const errors = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const env = {
      ...realtimeEnv,
      ONLINE_DIRECTORY: {
        idFromName: () => 'id',
        get: () => ({ authorize: async () => ({ ok: true, isHost: true, slot: 0, hostSessionId: 'host' }) }),
      },
    } as unknown as OnlineSignalingEnv;

    const response = await handleOnlineSignaling(
      new Request('https://example.test/online/datachannels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomCode: '2abcd',
          participantId: 'p1',
          sessionId: 'host',
          channels: [{ name: 'room' }],
        }),
      }),
      env,
      '/online/datachannels',
    );

    expect(response?.status).toBe(502);
    expect(String(errors.mock.calls[0]?.[1])).toContain('no such publisher');
  });
});
