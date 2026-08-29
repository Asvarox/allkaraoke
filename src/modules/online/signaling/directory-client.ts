import {
  IceServersResponse,
  JoinRoomRequest,
  JoinRoomResponse,
  PromoteHostRequest,
  PromoteHostResponse,
  RoomInfoResponse,
} from '~/modules/online/signaling/protocol';

/** Empty means same origin: in production the Worker serves the app itself, and in dev vite
 * proxies `/online` to `wrangler dev`. Set it only to point a build at another deployment. */
export const signalingUrl = (path: string) => `${import.meta.env.VITE_APP_SIGNALING_URL ?? ''}${path}`;

export const postSignaling = async <T>(path: string, body: unknown): Promise<T> => {
  const response = await fetch(signalingUrl(path), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!response.ok) throw new Error(`${path} failed with ${response.status}`);
  return (await response.json()) as T;
};

/**
 * The room directory: slot assignment and the host line of succession. Deliberately separate from
 * the data plane — it is the only part of online mode that still touches a server, and it works
 * the same whether the messages themselves travel over the SFU or over a local fabric.
 */
export const joinRoom = (roomCode: string, request: JoinRoomRequest) =>
  postSignaling<JoinRoomResponse>(`/online/room/${roomCode}/join`, request);

export const promoteHost = (roomCode: string, request: PromoteHostRequest) =>
  postSignaling<PromoteHostResponse>(`/online/room/${roomCode}/promote`, request);

export const leaveRoom = (roomCode: string, participantId: string, ban = false) =>
  postSignaling(`/online/room/${roomCode}/leave`, { participantId, ban }).catch(() => {
    // Best-effort: a browser being closed may not get this out at all, which is why the host also
    // releases a slot when the channel behind it drops.
  });

export const keepaliveRoom = (roomCode: string) =>
  postSignaling(`/online/room/${roomCode}/keepalive`, {}).catch(() => {
    // A single missed keepalive costs nothing — the TTL is six times the interval.
  });

/** ICE servers for this deployment: STUN always, TURN when it has been configured. Fetched rather
 * than compiled in because TURN credentials are short-lived and must not reach the bundle. */
export const fetchIceServers = async (): Promise<IceServersResponse | null> => {
  try {
    const response = await fetch(signalingUrl('/online/ice'));
    if (!response.ok) return null;
    return (await response.json()) as IceServersResponse;
  } catch {
    return null;
  }
};

const ROOM_INFO_TIMEOUT_MS = 5_000;

export const fetchRoomInfo = async (roomCode: string): Promise<RoomInfoResponse | null> => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), ROOM_INFO_TIMEOUT_MS);
  try {
    const response = await fetch(signalingUrl(`/online/room/${roomCode.toLowerCase()}`), { signal: controller.signal });
    if (!response.ok) return null;
    return (await response.json()) as RoomInfoResponse;
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
};
