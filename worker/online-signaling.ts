// Relative imports on purpose: the `~` alias is only configured for the app build, not the Worker one
import type {
  CreateDataChannelsRequest,
  CreateDataChannelsResponse,
  CreateSessionRequest,
  CreateSessionResponse,
  JoinRoomRequest,
  LeaveRoomRequest,
  IceServerDto,
  IceServersResponse,
  OnlineDataPlane,
  PromoteHostRequest,
  SessionDescriptionDto,
} from '../src/modules/online/signaling/protocol';
import type { OnlineDirectory } from './online-directory-do';

export interface OnlineSignalingEnv {
  REALTIME_APP_ID?: string;
  REALTIME_APP_TOKEN?: string;
  ONLINE_DIRECTORY?: DurableObjectNamespace<OnlineDirectory>;

  /** Comma-separated STUN URLs. Only worth setting to move off Cloudflare's — STUN is
   * unauthenticated, so the default works with nothing configured. */
  ONLINE_STUN_URLS?: string;

  /** Cloudflare Realtime TURN. Separate credentials from the SFU app: a TURN key id and its API
   * token, used to mint short-lived per-client credentials. Opt-in — without them clients get
   * STUN only, which is all most networks need. */
  REALTIME_TURN_KEY_ID?: string;
  REALTIME_TURN_API_TOKEN?: string;

  /** A TURN server of your own (coturn, a provider) instead of Cloudflare's. Static credentials,
   * so prefer the Realtime pair above where possible — these are handed to every client as-is. */
  ONLINE_TURN_URLS?: string;
  ONLINE_TURN_USERNAME?: string;
  ONLINE_TURN_CREDENTIAL?: string;
}

const REALTIME_API_BASE = 'https://rtc.live.cloudflare.com/v1/apps';
const REALTIME_TURN_API_BASE = 'https://rtc.live.cloudflare.com/v1/turn/keys';

/** Cloudflare's public STUN, which takes no credentials — the reason online mode connects at all
 * on a checkout with nothing configured. Port 53 is there because some networks only let
 * DNS-looking traffic out. */
const DEFAULT_STUN_URLS = ['stun:stun.cloudflare.com:3478', 'stun:stun.cloudflare.com:53'];

/** Lifetime of a minted TURN credential. Comfortably longer than a karaoke session, short enough
 * that a credential handed to a client is not useful forever. An allocation already in progress is
 * unaffected when it lapses; the next connection mints a fresh one. */
const TURN_CREDENTIAL_TTL_SECONDS = 2 * 60 * 60;

/** Re-mint this long before expiry rather than handing out a credential about to lapse. */
const TURN_REFRESH_MARGIN_MS = 10 * 60 * 1_000;

/** Room codes are the only thing that reaches the directory as a Durable Object name, so they are
 * pinned to exactly what the game generates before anything is looked up. */
const ROOM_CODE_PATTERN = /^[a-z0-9]{5}$/;

/**
 * The channel every session establishes its SCTP transport with. Cloudflare's establish endpoint
 * wants a channel alongside the SDP offer, but a browser does not know whether it is the host
 * until it has a session id to join the directory with — so everybody opens the same throwaway
 * local channel here and gets its real ones on the second call, once its role is known.
 */
const BOOTSTRAP_CHANNEL = 'self';

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      // The dev server runs on a different origin than the Worker; in production they are the same.
      'Access-Control-Allow-Origin': '*',
    },
  });

const badRequest = (message: string) => json({ error: message }, 400);

interface RealtimeCallOptions {
  env: OnlineSignalingEnv;
  path: string;
  method?: 'POST' | 'PUT';
  body: unknown;
}

/** Every SFU call goes through here so the app token never leaves the Worker. */
const callRealtime = async <T>({ env, path, method = 'POST', body }: RealtimeCallOptions): Promise<T> => {
  const response = await fetch(`${REALTIME_API_BASE}/${env.REALTIME_APP_ID}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${env.REALTIME_APP_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    throw new Error(`Realtime API ${path} failed: ${response.status} ${await response.text()}`);
  }
  return (await response.json()) as T;
};

/** Minted credentials, memoised per isolate so a room full of singers joining at once does not
 * mint one apiece. Keyed by TURN key id: rotating the key must not keep handing out credentials
 * minted with the old one. Not shared between isolates, which only costs a few extra mints. */
const cachedTurn = new Map<string, { servers: IceServerDto[]; expiresAt: number }>();

const splitUrls = (value: string | undefined): string[] =>
  (value ?? '')
    .split(',')
    .map((url) => url.trim())
    .filter(Boolean);

const mintCloudflareTurn = async (env: OnlineSignalingEnv): Promise<IceServerDto[]> => {
  const keyId = env.REALTIME_TURN_KEY_ID!;
  const cached = cachedTurn.get(keyId);
  if (cached && cached.expiresAt - TURN_REFRESH_MARGIN_MS > Date.now()) return cached.servers;

  const response = await fetch(`${REALTIME_TURN_API_BASE}/${keyId}/credentials/generate-ice-servers`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.REALTIME_TURN_API_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ ttl: TURN_CREDENTIAL_TTL_SECONDS }),
  });
  if (!response.ok) throw new Error(`TURN credential minting failed: ${response.status}`);

  const { iceServers } = (await response.json()) as { iceServers: IceServerDto[] | IceServerDto };
  // The API answers with an array, but has been documented both ways — accept either rather than
  // dropping TURN on a shape change.
  const servers = Array.isArray(iceServers) ? iceServers : [iceServers];
  cachedTurn.set(keyId, { servers, expiresAt: Date.now() + TURN_CREDENTIAL_TTL_SECONDS * 1_000 });
  return servers;
};

const handleIceServers = async (env: OnlineSignalingEnv) => {
  const stun: IceServerDto = {
    urls: splitUrls(env.ONLINE_STUN_URLS).length ? splitUrls(env.ONLINE_STUN_URLS) : DEFAULT_STUN_URLS,
  };

  if (env.REALTIME_TURN_KEY_ID && env.REALTIME_TURN_API_TOKEN) {
    try {
      const servers = await mintCloudflareTurn(env);
      // Cloudflare's response already carries its own STUN entry, so it is returned as-is.
      return json<IceServersResponse>({ iceServers: servers, ttlSeconds: TURN_CREDENTIAL_TTL_SECONDS });
    } catch (error) {
      // TURN is a fallback for a minority of networks; losing it must not stop everyone else
      // joining, so this degrades to STUN rather than failing the request.
      console.error('Falling back to STUN only', error);
      return json<IceServersResponse>({ iceServers: [stun] });
    }
  }

  const staticTurnUrls = splitUrls(env.ONLINE_TURN_URLS);
  if (staticTurnUrls.length) {
    return json<IceServersResponse>({
      iceServers: [
        stun,
        {
          urls: staticTurnUrls,
          ...(env.ONLINE_TURN_USERNAME ? { username: env.ONLINE_TURN_USERNAME } : {}),
          ...(env.ONLINE_TURN_CREDENTIAL ? { credential: env.ONLINE_TURN_CREDENTIAL } : {}),
        },
      ],
    });
  }

  return json<IceServersResponse>({ iceServers: [stun] });
};

const isSessionDescription = (value: unknown): value is SessionDescriptionDto => {
  const candidate = value as SessionDescriptionDto | undefined;
  return typeof candidate?.sdp === 'string' && (candidate.type === 'offer' || candidate.type === 'answer');
};

const getDirectory = (env: OnlineSignalingEnv, roomCode: string) => {
  const namespace = env.ONLINE_DIRECTORY!;
  return namespace.get(namespace.idFromName(roomCode));
};

const handleCreateSession = async (request: Request, env: OnlineSignalingEnv) => {
  const body = (await request.json().catch(() => null)) as CreateSessionRequest | null;
  if (!isSessionDescription(body?.offer)) return badRequest('offer required');

  const created = await callRealtime<{ sessionId: string }>({
    env,
    path: '/sessions/new',
    body: {},
  });

  const established = await callRealtime<{ sessionDescription: SessionDescriptionDto }>({
    env,
    path: `/sessions/${created.sessionId}/datachannels/establish`,
    body: {
      dataChannel: { location: 'local', dataChannelName: BOOTSTRAP_CHANNEL },
      sessionDescription: { type: 'offer', sdp: body!.offer.sdp },
    },
  });

  return json<CreateSessionResponse>({
    sessionId: created.sessionId,
    answer: established.sessionDescription,
  } satisfies CreateSessionResponse);
};

const handleCreateDataChannels = async (request: Request, env: OnlineSignalingEnv) => {
  const body = (await request.json().catch(() => null)) as CreateDataChannelsRequest | null;
  if (!body?.sessionId || !Array.isArray(body.channels) || body.channels.length === 0) {
    return badRequest('sessionId and channels required');
  }

  const result = await callRealtime<{ dataChannels: Array<{ dataChannelName: string; id: number }> }>({
    env,
    path: `/sessions/${body.sessionId}/datachannels/new`,
    body: {
      dataChannels: body.channels.map((channel) =>
        channel.publisherSessionId
          ? {
              location: 'remote',
              sessionId: channel.publisherSessionId,
              dataChannelName: channel.name,
              ...(channel.canReply ? { canReply: true } : {}),
            }
          : { location: 'local', dataChannelName: channel.name },
      ),
    },
  });

  return json<CreateDataChannelsResponse>({
    channels: result.dataChannels.map((channel) => ({ name: channel.dataChannelName, id: channel.id })),
  });
};

const handleRoom = async (
  request: Request,
  env: OnlineSignalingEnv,
  roomCode: string,
  action: string,
  dataPlane: OnlineDataPlane,
) => {
  const directory = getDirectory(env, roomCode);

  if (action === '' && request.method === 'GET') {
    return json(await directory.info(dataPlane));
  }

  if (action === 'relay') {
    // The relay exists for environments with no Realtime app to talk to. Refusing it whenever the
    // SFU *is* configured is what stops production from ever falling back onto a data plane that
    // would put every message back through a Durable Object.
    if (dataPlane !== 'relay') return json({ error: 'Relay is disabled' }, 404);
    if (request.headers.get('Upgrade') !== 'websocket') return json({ error: 'Expected websocket' }, 426);
    // Forwarded rather than called as RPC: a 101 response carrying a `webSocket` cannot cross the
    // Durable Object RPC boundary.
    return directory.fetch(request);
  }
  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;

  if (action === 'join') {
    const { participantId, sessionId, create } = (body ?? {}) as unknown as JoinRoomRequest;
    if (!participantId || !sessionId) return badRequest('participantId and sessionId required');
    return json(await directory.join(participantId, sessionId, create === true));
  }
  if (action === 'leave') {
    const { participantId } = (body ?? {}) as unknown as LeaveRoomRequest;
    if (!participantId) return badRequest('participantId required');
    await directory.leave(participantId);
    return json({ ok: true });
  }
  if (action === 'promote') {
    const { participantId, sessionId, fromEpoch } = (body ?? {}) as unknown as PromoteHostRequest;
    if (!participantId || !sessionId || typeof fromEpoch !== 'number') {
      return badRequest('participantId, sessionId and fromEpoch required');
    }
    return json(await directory.promote(participantId, sessionId, fromEpoch));
  }
  if (action === 'keepalive') {
    await directory.keepalive();
    return json({ ok: true });
  }

  return json({ error: 'Not found' }, 404);
};

/** Routes everything under `/online/`. Returns null when the path is not ours. */
export const handleOnlineSignaling = async (
  request: Request,
  env: OnlineSignalingEnv,
  pathname: string,
): Promise<Response | null> => {
  if (!pathname.startsWith('/online/')) return null;

  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  if (!env.ONLINE_DIRECTORY) {
    return json({ error: 'Online mode is not configured' }, 503);
  }

  // Only the SFU endpoints need Realtime credentials. The directory does not, which is what lets
  // the end-to-end suite run the real slot assignment and host election against a local data plane.
  const hasRealtimeCredentials = Boolean(env.REALTIME_APP_ID && env.REALTIME_APP_TOKEN);

  try {
    const rest = pathname.slice('/online/'.length);

    // Deliberately not gated on Realtime credentials: STUN needs none, and a checkout without an
    // app configured still runs online mode on the relay, which is exactly when this must answer.
    if (rest === 'ice' && request.method === 'GET') return await handleIceServers(env);

    if (rest === 'session' || rest === 'datachannels') {
      if (!hasRealtimeCredentials) return json({ error: 'Realtime is not configured' }, 503);
      if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
      return rest === 'session'
        ? await handleCreateSession(request, env)
        : await handleCreateDataChannels(request, env);
    }

    if (rest.startsWith('room/')) {
      const [roomCode, action = ''] = rest.slice('room/'.length).split('/');
      if (!ROOM_CODE_PATTERN.test(roomCode ?? '')) return badRequest('invalid room code');
      return await handleRoom(request, env, roomCode, action, hasRealtimeCredentials ? 'sfu' : 'relay');
    }

    return json({ error: 'Not found' }, 404);
  } catch (error) {
    console.error('Online signaling failed', error);
    return json({ error: 'Signaling failed' }, 502);
  }
};
