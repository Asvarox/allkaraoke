import { fetchIceServers, postSignaling } from '~/modules/online/signaling/directory-client';
import {
  AnswerSessionRequest,
  CreateDataChannelsRequest,
  CreateDataChannelsResponse,
  CreateSessionResponse,
  DataChannelSpec,
} from '~/modules/online/signaling/protocol';

/**
 * Used when the Worker cannot be asked what to use — a hiccup on that request must not stop a join,
 * and STUN is unauthenticated so there is nothing to be missing.
 *
 * STUN alone is usually enough here: every participant connects to the SFU rather than to each
 * other, so there is no peer-to-peer traversal to fail. TURN only matters on networks that block
 * UDP to the SFU outright, and the deployment opts into it by configuring one (see the Worker).
 */
const FALLBACK_ICE_SERVERS: RTCIceServer[] = [
  { urls: ['stun:stun.cloudflare.com:3478', 'stun:stun.cloudflare.com:53'] },
];

/** How long the transport may take to come up once the answer is in. Bounded so an SFU that is
 * unreachable (UDP blocked, no TURN) fails the join with a clear reason instead of hanging it. */
const CONNECT_TIMEOUT_MS = 20_000;

const waitForConnected = (peerConnection: RTCPeerConnection) =>
  new Promise<void>((resolve, reject) => {
    const check = () => {
      if (peerConnection.connectionState === 'connected') {
        cleanup();
        resolve();
      } else if (peerConnection.connectionState === 'failed' || peerConnection.connectionState === 'closed') {
        cleanup();
        reject(new Error(`SFU connection ${peerConnection.connectionState}`));
      }
    };
    const timeout = setTimeout(() => {
      cleanup();
      reject(new Error(`SFU connection still ${peerConnection.connectionState} after ${CONNECT_TIMEOUT_MS}ms`));
    }, CONNECT_TIMEOUT_MS);
    const cleanup = () => {
      clearTimeout(timeout);
      peerConnection.removeEventListener('connectionstatechange', check);
    };
    peerConnection.addEventListener('connectionstatechange', check);
    check();
  });

/**
 * One WebRTC connection to the Cloudflare Realtime SFU, plus the channels opened over it.
 *
 * Everything the SFU needs to be told goes through our own Worker, which holds the app token —
 * this class never talks to Cloudflare directly. Channels are *negotiated*: the Worker's response
 * carries the id both ends must use, so adding one costs no SDP renegotiation and a room can wire
 * up its whole slot pool at once.
 */
export class SfuSession {
  private peerConnection: RTCPeerConnection | null = null;
  private sessionId: string | null = null;
  private readonly channels = new Map<string, RTCDataChannel>();
  private readonly lostListeners = new Set<() => void>();

  /** Fires when the transport to the SFU is gone for good. 'disconnected' is deliberately not
   * included — it is a transient ICE state that recovers on its own, and treating it as fatal
   * would tear down a room over a brief network hiccup. */
  public onLost = (listener: () => void) => {
    this.lostListeners.add(listener);
    return () => this.lostListeners.delete(listener);
  };

  public getSessionId = () => this.sessionId;

  public isConnected = () =>
    this.peerConnection?.connectionState === 'connected' || this.peerConnection?.connectionState === 'connecting';

  /** Opens the peer connection and registers it with the SFU. Resolves with the session id, which
   * is what the room directory identifies this browser's media plane by. */
  public open = async (): Promise<string> => {
    try {
      return await this.negotiate();
    } catch (error) {
      // Anything from here on leaves a peer connection nobody owns — the caller only ever sees the
      // rejection, so it cannot close it for us.
      this.close();
      throw error;
    }
  };

  private negotiate = async (): Promise<string> => {
    const ice = await fetchIceServers();
    const peerConnection = new RTCPeerConnection({
      iceServers: ice?.iceServers ?? FALLBACK_ICE_SERVERS,
      bundlePolicy: 'max-bundle',
    });
    this.peerConnection = peerConnection;
    peerConnection.addEventListener('connectionstatechange', () => {
      if (peerConnection.connectionState === 'failed' || peerConnection.connectionState === 'closed') {
        this.lostListeners.forEach((listener) => listener());
      }
    });

    // The SFU makes the offer and this browser answers it — Cloudflare's data-channel handshake. The
    // offer already carries the SCTP transport, so nothing has to be opened here first.
    const { sessionId, offer, answerToken } = await postSignaling<CreateSessionResponse>('/online/session', {});
    await peerConnection.setRemoteDescription({ type: 'offer', sdp: offer.sdp });
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);
    // Sent as soon as it exists, without waiting for local candidates: the SFU is ICE-lite, so it
    // learns this browser's address from the connectivity checks it receives — the same as
    // Cloudflare's own example does.
    await postSignaling('/online/session/answer', {
      sessionId,
      answer: { type: 'answer', sdp: peerConnection.localDescription!.sdp },
      answerToken,
    } satisfies AnswerSessionRequest);
    // Waited out here rather than left to the channels: a transport that never comes up then fails
    // with that as the reason, instead of as a channel timing out somewhere downstream.
    await waitForConnected(peerConnection);

    this.sessionId = sessionId;
    return sessionId;
  };

  /**
   * Opens negotiated data channels on this session. Publisher channels (no `publisherSessionId`)
   * are what the host broadcasts on; subscriber channels point at the host's session, and the one
   * with `canReply` is the caller's private upstream pipe.
   */
  public createChannels = async (
    roomCode: string,
    participantId: string,
    specs: DataChannelSpec[],
  ): Promise<Map<string, RTCDataChannel>> => {
    if (!this.peerConnection || !this.sessionId) throw new Error('SFU session is not open');

    const { channels } = await postSignaling<CreateDataChannelsResponse>('/online/datachannels', {
      roomCode,
      participantId,
      sessionId: this.sessionId,
      channels: specs,
    } satisfies CreateDataChannelsRequest);

    const opened = new Map<string, RTCDataChannel>();
    for (const { name, id } of channels) {
      // Both ends open the same id without renegotiating — that is what `negotiated` means here.
      const channel = this.peerConnection.createDataChannel(name, { negotiated: true, id });
      this.channels.set(name, channel);
      opened.set(name, channel);
    }
    return opened;
  };

  public getChannel = (name: string) => this.channels.get(name);

  public close = () => {
    this.lostListeners.clear();
    this.channels.forEach((channel) => channel.close());
    this.channels.clear();
    this.peerConnection?.close();
    this.peerConnection = null;
    this.sessionId = null;
  };
}
