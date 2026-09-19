/**
 * A stand-in for the Cloudflare Realtime SFU, for the end-to-end suite.
 *
 * Implements only what `worker/online-signaling.ts` calls, with a real WebRTC endpoint behind it
 * (werift), so the browser runs the production `SfuSession` / `SfuRoomConnection` code — the SFU
 * handshake, negotiated channel ids, the transport coming up — instead of the relay.
 *
 * The routing mirrors Cloudflare's data-channel semantics as `docs/online-mode.md` describes them:
 * - a `local` channel is something the session publishes; whatever the browser sends on it goes to
 *   every subscriber of that channel;
 * - a `remote` channel subscribes to another session's `local` channel of the same name;
 * - `canReply` makes one subscriber's messages flow back to the publisher, and a later grant revokes
 *   the earlier one.
 *
 * It encodes our reading of the API, not the API itself — `online-signaling.test.ts` still pins the
 * exact requests, and only the real SFU can prove the reading right.
 *
 * Run: `node tests/fake-sfu/server.mts` (FAKE_SFU_PORT, default 3480).
 */
import { createServer, IncomingMessage, ServerResponse } from 'node:http';
import { randomUUID } from 'node:crypto';
import { RTCDataChannel, RTCPeerConnection } from 'werift';

const PORT = Number(process.env.FAKE_SFU_PORT ?? 3480);

/** Negotiated ids are handed out from here up, clear of whatever werift picks for the transport's
 * own (in-band negotiated) channel. */
const FIRST_NEGOTIATED_ID = 100;

/** Longer than the browser's own connect timeout in `SfuSession`. */
const UNCONNECTED_SESSION_TTL_MS = 60_000;

interface Subscription {
  subscriberSessionId: string;
  channel: RTCDataChannel;
}

interface Publication {
  channel: RTCDataChannel;
  subscribers: Set<Subscription>;
  /** The one subscriber whose messages reach the publisher. */
  replier: Subscription | null;
}

interface Session {
  id: string;
  peerConnection: RTCPeerConnection;
  nextChannelId: number;
  /** Keyed by channel name. */
  publications: Map<string, Publication>;
}

/** One item of a `datachannels/new` request, as the Worker sends it. */
interface DataChannelRequest {
  location: 'local' | 'remote';
  dataChannelName: string;
  /** The publisher's session, for `remote`. */
  sessionId?: string;
  canReply?: boolean;
}

/** The union of every request body this server reads; each handler looks only at its own fields. */
interface RequestBody {
  dataChannel?: { dataChannelName?: string };
  sessionDescription?: { type?: string; sdp?: string };
  dataChannels?: DataChannelRequest[];
}

const sessions = new Map<string, Session>();

/** Subscriptions made before the publisher opened the channel — attached once it does. */
const pendingSubscriptions = new Map<string, Array<{ subscription: Subscription; canReply: boolean }>>();
const publicationKey = (sessionId: string, name: string) => `${sessionId}/${name}`;

const log = (...args: unknown[]) => {
  if (process.env.FAKE_SFU_DEBUG) console.log('[fake-sfu]', ...args);
};

const readJson = async (request: IncomingMessage): Promise<RequestBody | undefined> => {
  const chunks: Buffer[] = [];
  for await (const chunk of request) chunks.push(chunk as Buffer);
  const text = Buffer.concat(chunks).toString('utf8');
  return text ? JSON.parse(text) : undefined;
};

const send = (response: ServerResponse, status: number, body: unknown) => {
  response.writeHead(status, { 'Content-Type': 'application/json' });
  response.end(JSON.stringify(body));
};

const waitForGatheringComplete = (peerConnection: RTCPeerConnection) =>
  new Promise<void>((resolve) => {
    if (peerConnection.iceGatheringState === 'complete') return resolve();
    const { unSubscribe } = peerConnection.iceGatheringStateChange.subscribe((state) => {
      if (state === 'complete') {
        unSubscribe();
        resolve();
      }
    });
  });

const closeSession = (session: Session) => {
  if (!sessions.delete(session.id)) return;
  log('session closed', session.id);
  session.publications.forEach((publication) => {
    publication.subscribers.forEach(({ channel }) => channel.close());
  });
  sessions.forEach((other) =>
    other.publications.forEach((publication) => {
      publication.subscribers.forEach((subscription) => {
        if (subscription.subscriberSessionId === session.id) publication.subscribers.delete(subscription);
      });
      if (publication.replier?.subscriberSessionId === session.id) publication.replier = null;
    }),
  );
  void session.peerConnection.close();
};

const createSession = (): Session => {
  const peerConnection = new RTCPeerConnection({ iceUseIpv6: false });
  const session: Session = {
    id: randomUUID().replaceAll('-', ''),
    peerConnection,
    nextChannelId: FIRST_NEGOTIATED_ID,
    publications: new Map(),
  };
  peerConnection.connectionStateChange.subscribe((state) => {
    log('session', session.id, state);
    if (state === 'failed' || state === 'closed') closeSession(session);
  });
  sessions.set(session.id, session);
  // A browser that gave up mid-handshake never reaches 'failed' — reap it instead of keeping its
  // peer connection (and ports) for the rest of the run.
  setTimeout(() => {
    if (peerConnection.connectionState !== 'connected') closeSession(session);
  }, UNCONNECTED_SESSION_TTL_MS).unref();
  return session;
};

const attachSubscription = (publication: Publication, subscription: Subscription, canReply: boolean) => {
  publication.subscribers.add(subscription);
  if (canReply) publication.replier = subscription;
};

const openPublication = (session: Session, name: string, channel: RTCDataChannel) => {
  const publication: Publication = { channel, subscribers: new Set(), replier: null };
  session.publications.set(name, publication);

  channel.onMessage.subscribe((data) => {
    publication.subscribers.forEach(({ channel: subscriber }) => {
      if (subscriber.readyState === 'open') subscriber.send(data);
    });
  });

  const key = publicationKey(session.id, name);
  pendingSubscriptions
    .get(key)
    ?.forEach(({ subscription, canReply }) => attachSubscription(publication, subscription, canReply));
  pendingSubscriptions.delete(key);
};

const openSubscription = (
  session: Session,
  spec: DataChannelRequest & { sessionId: string },
  channel: RTCDataChannel,
) => {
  const subscription: Subscription = { subscriberSessionId: session.id, channel };
  const canReply = spec.canReply === true;
  const publication = sessions.get(spec.sessionId)?.publications.get(spec.dataChannelName);

  if (publication) {
    attachSubscription(publication, subscription, canReply);
  } else {
    const key = publicationKey(spec.sessionId, spec.dataChannelName);
    pendingSubscriptions.set(key, [...(pendingSubscriptions.get(key) ?? []), { subscription, canReply }]);
  }

  channel.onMessage.subscribe((data) => {
    const current = sessions.get(spec.sessionId)?.publications.get(spec.dataChannelName);
    // Only the current reply grant reaches the publisher; everyone else's upstream is dropped.
    if (current?.replier !== subscription) return;
    if (current.channel.readyState === 'open') current.channel.send(data);
  });
  channel.stateChanged.subscribe((state) => {
    if (state !== 'closed') return;
    const current = sessions.get(spec.sessionId)?.publications.get(spec.dataChannelName);
    current?.subscribers.delete(subscription);
    if (current?.replier === subscription) current.replier = null;
  });
};

type Handler = (session: Session, body: RequestBody | undefined) => Promise<[number, unknown]>;

const handlers: Record<string, Handler> = {
  'POST datachannels/establish': async (session, body) => {
    // The transport's own channel. Present because the real API needs one; nothing uses it.
    session.peerConnection.createDataChannel(body?.dataChannel?.dataChannelName ?? 'server-events');
    await session.peerConnection.setLocalDescription(await session.peerConnection.createOffer());
    await waitForGatheringComplete(session.peerConnection);
    return [
      200,
      {
        sessionDescription: { type: 'offer', sdp: session.peerConnection.localDescription!.sdp },
        requiresImmediateRenegotiation: true,
      },
    ];
  },

  'PUT renegotiate': async (session, body) => {
    const description = body?.sessionDescription;
    if (description?.type !== 'answer' || typeof description.sdp !== 'string') {
      return [400, { errorCode: 'bad_request', errorDescription: 'answer required' }];
    }
    await session.peerConnection.setRemoteDescription({ type: 'answer', sdp: description.sdp });
    return [200, {}];
  },

  'POST datachannels/new': async (session, body) => {
    const specs = body?.dataChannels ?? [];
    const dataChannels = specs.map((spec) => {
      const { sessionId: publisherSessionId } = spec;
      if (spec.location === 'remote' && (!publisherSessionId || !sessions.has(publisherSessionId))) {
        return { dataChannelName: spec.dataChannelName, errorCode: 'not_found', errorDescription: 'no such session' };
      }
      const id = session.nextChannelId++;
      const channel = session.peerConnection.createDataChannel(spec.dataChannelName, { negotiated: true, id });
      if (spec.location === 'local') openPublication(session, spec.dataChannelName, channel);
      else openSubscription(session, { ...spec, sessionId: publisherSessionId! }, channel);
      log('channel', session.id, spec.location, spec.dataChannelName, id);
      return { dataChannelName: spec.dataChannelName, id };
    });
    return [200, { dataChannels }];
  },
};

const server = createServer(async (request, response) => {
  try {
    const url = new URL(request.url ?? '/', 'http://localhost');
    // /v1/apps/:appId/sessions/new | /v1/apps/:appId/sessions/:sessionId/<action>
    const match = url.pathname.match(/^\/v1\/apps\/[^/]+\/sessions\/([^/]+)(?:\/(.+))?$/);
    if (!match) return send(response, 404, { errorCode: 'not_found' });
    const [, sessionPart, action] = match;

    if (sessionPart === 'new' && !action && request.method === 'POST') {
      // Mirrors the real API, which rejects any body here — even `{}`.
      if ((request.headers['content-length'] ?? '0') !== '0') {
        return send(response, 400, { errorCode: 'decoding_error', errorDescription: 'sessions/new takes no body' });
      }
      const session = createSession();
      log('session created', session.id);
      return send(response, 200, { sessionId: session.id });
    }

    const session = sessions.get(sessionPart);
    if (!session) return send(response, 404, { errorCode: 'not_found', errorDescription: 'no such session' });
    const handler = handlers[`${request.method} ${action}`];
    if (!handler) return send(response, 404, { errorCode: 'not_found' });

    const [status, body] = await handler(session, await readJson(request));
    return send(response, status, body);
  } catch (error) {
    console.error('[fake-sfu]', error);
    return send(response, 500, { errorCode: 'internal', errorDescription: String(error) });
  }
});

server.listen(PORT, () => console.log(`[fake-sfu] listening on http://localhost:${PORT}`));
