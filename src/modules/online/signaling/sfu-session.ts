import { fetchIceServers, postSignaling } from '~/modules/online/signaling/directory-client';
import {
  CreateDataChannelsRequest,
  CreateDataChannelsResponse,
  CreateSessionRequest,
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

/** The SFU signalling API takes one complete offer — there is no trickle-ICE endpoint — so the
 * local description has to be fully gathered before it is sent. Capped because a candidate that
 * never arrives (a blocked STUN port) would otherwise hang the join forever; what has been
 * gathered by then is normally enough to connect. */
const ICE_GATHERING_TIMEOUT_MS = 3_000;

const waitForIceGathering = (peerConnection: RTCPeerConnection) =>
  new Promise<void>((resolve) => {
    if (peerConnection.iceGatheringState === 'complete') {
      resolve();
      return;
    }
    const done = () => {
      clearTimeout(timeout);
      peerConnection.removeEventListener('icegatheringstatechange', onChange);
      resolve();
    };
    const onChange = () => {
      if (peerConnection.iceGatheringState === 'complete') done();
    };
    const timeout = setTimeout(done, ICE_GATHERING_TIMEOUT_MS);
    peerConnection.addEventListener('icegatheringstatechange', onChange);
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

    // An offer only carries an SCTP m-line if the connection has at least one data channel when it
    // is created. Every real channel here is negotiated (so it cannot be the one that does this),
    // which leaves a throwaway as the only way to get the transport into the SDP.
    peerConnection.createDataChannel('sctp-bootstrap');

    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    await waitForIceGathering(peerConnection);

    const { sessionId, answer } = await postSignaling<CreateSessionResponse>('/online/session', {
      offer: { type: 'offer', sdp: peerConnection.localDescription!.sdp },
    } satisfies CreateSessionRequest);

    await peerConnection.setRemoteDescription({ type: 'answer', sdp: answer.sdp });
    this.sessionId = sessionId;
    return sessionId;
  };

  /**
   * Opens negotiated data channels on this session. Publisher channels (no `publisherSessionId`)
   * are what the host broadcasts on; subscriber channels point at the host's session, and the one
   * with `canReply` is the caller's private upstream pipe.
   */
  public createChannels = async (specs: DataChannelSpec[]): Promise<Map<string, RTCDataChannel>> => {
    if (!this.peerConnection || !this.sessionId) throw new Error('SFU session is not open');

    const { channels } = await postSignaling<CreateDataChannelsResponse>('/online/datachannels', {
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
