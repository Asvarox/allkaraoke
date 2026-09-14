import { OnlineClientTransport, OnlinePeerSender } from '~/modules/online/client/transport/interface';
import { OnlineMessages } from '~/modules/online/protocol/types';

/**
 * The host is a singer too, and its own client has no business going out to the SFU and back to
 * reach room logic running in the same tab. This is that shortcut: a transport on one side, a peer
 * sender on the other, wired straight together.
 *
 * Delivery is deferred to a microtask rather than made re-entrant. A handler that sends while
 * handling would otherwise run nested inside the sender's own stack, which is something no real
 * connection can do — and the room logic is full of publish-during-handle paths that would then
 * behave differently for the host than for everyone else.
 */
export class LoopbackTransportPair {
  private clientListeners = new Set<(message: OnlineMessages) => void>();
  private hostListeners = new Set<(message: OnlineMessages, sender: OnlinePeerSender) => void>();
  private closed = false;

  public constructor(private readonly participantId: string) {}

  private deliverToClient = (message: OnlineMessages) => {
    if (this.closed) return;
    queueMicrotask(() => this.clientListeners.forEach((listener) => listener(message)));
  };

  /** The host-side half: looks to `RpcServer` exactly like any other connected participant. */
  public readonly peer: OnlinePeerSender = {
    peer: this.participantId,
    send: (payload) => this.deliverToClient(payload as OnlineMessages),
  };

  /** The client-side half: looks to `OnlineClient` exactly like a socket. */
  public readonly transport: OnlineClientTransport = {
    isConnected: () => !this.closed,
    sendEvent: (message) => {
      if (this.closed) return;
      queueMicrotask(() => this.hostListeners.forEach((listener) => listener(message as OnlineMessages, this.peer)));
    },
    addListener: (listener) => {
      this.clientListeners.add(listener);
      return () => this.clientListeners.delete(listener);
    },
    removeListener: (listener) => this.clientListeners.delete(listener),
    clearAllListeners: () => this.clientListeners.clear(),
    close: () => this.close(),
  };

  public addHostListener = (listener: (message: OnlineMessages, sender: OnlinePeerSender) => void) => {
    this.hostListeners.add(listener);
    return () => this.hostListeners.delete(listener);
  };

  public close = () => {
    this.closed = true;
    this.clientListeners.clear();
    this.hostListeners.clear();
  };
}
