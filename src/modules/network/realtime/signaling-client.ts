import {
  IceServersResponse,
  JoinRoomRequest,
  JoinRoomResponse,
  PromoteHostRequest,
  PromoteHostResponse,
  RealtimeService,
  RoomInfoResponse,
} from '~/modules/network/realtime/protocol';

/** Empty means same origin: in production the Worker serves the app itself, and in dev the
 * Cloudflare vite plugin runs it inside the dev server. Set it only to point a build at another
 * deployment. */
const signalingUrl = (path: string) => `${import.meta.env.VITE_APP_SIGNALING_URL ?? ''}${path}`;

const ROOM_INFO_TIMEOUT_MS = 5_000;

/**
 * One feature's signaling endpoints: SFU session setup and its room directory — slot assignment
 * and the host line of succession. Deliberately separate from the data plane: it is the only part
 * that still touches a server, and it works the same whether the messages themselves travel over
 * the SFU or over a local fabric.
 */
export class SignalingClient {
  public constructor(private readonly service: RealtimeService) {}

  public post = async <T>(path: string, body: unknown): Promise<T> => {
    const url = `${this.service.basePath}${path}`;
    const response = await fetch(signalingUrl(url), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!response.ok) throw new Error(`${url} failed with ${response.status}`);
    return (await response.json()) as T;
  };

  public joinRoom = (roomCode: string, request: JoinRoomRequest) =>
    this.post<JoinRoomResponse>(`/room/${roomCode}/join`, request);

  public promoteHost = (roomCode: string, request: PromoteHostRequest) =>
    this.post<PromoteHostResponse>(`/room/${roomCode}/promote`, request);

  public leaveRoom = (
    roomCode: string,
    participantId: string,
    requestedBy: { participantId: string; sessionId: string },
    ban = false,
  ) =>
    this.post(`/room/${roomCode}/leave`, { participantId, requestedBy, ban }).catch(() => {
      // Best-effort: a browser being closed may not get this out at all, which is why the host also
      // releases a slot when the channel behind it drops.
    });

  public keepaliveRoom = (roomCode: string) =>
    this.post(`/room/${roomCode}/keepalive`, {}).catch(() => {
      // A single missed keepalive costs nothing — the TTL is six times the interval.
    });

  /** ICE servers for this deployment: STUN always, TURN when it has been configured. Fetched rather
   * than compiled in because TURN credentials are short-lived and must not reach the bundle. */
  public fetchIceServers = async (): Promise<IceServersResponse | null> => {
    try {
      const response = await fetch(signalingUrl(`${this.service.basePath}/ice`));
      if (!response.ok) return null;
      return (await response.json()) as IceServersResponse;
    } catch {
      return null;
    }
  };

  public fetchRoomInfo = async (roomCode: string): Promise<RoomInfoResponse | null> => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), ROOM_INFO_TIMEOUT_MS);
    try {
      const response = await fetch(signalingUrl(`${this.service.basePath}/room/${roomCode.toLowerCase()}`), {
        signal: controller.signal,
      });
      if (!response.ok) return null;
      return (await response.json()) as RoomInfoResponse;
    } catch {
      return null;
    } finally {
      clearTimeout(timeout);
    }
  };
}
