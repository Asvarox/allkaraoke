import { OnlineClientTransport, OnlineRoomChannels } from '~/modules/online/client/transport/interface';
import { OnlineMessages } from '~/modules/online/protocol/types';

/**
 * `OnlineClient`'s view of a room hosted in somebody else's browser.
 *
 * Two channels come in — the host's broadcast (state pushes, heartbeats, snapshots) and this
 * client's own slot (replies to its RPC calls, its join verdict) — and both are handed to the same
 * listeners, because nothing above this layer cares which one a frame arrived on. Everything sent
 * goes up the slot, which is the only half of the wiring this client is allowed to write to.
 */
export class SfuClientTransport implements OnlineClientTransport {
  private listeners = new Set<(message: OnlineMessages) => void>();
  private detach: (() => void) | null = null;

  public constructor(private readonly connection: OnlineRoomChannels) {
    this.detach = connection.onMessage((message) => {
      this.listeners.forEach((listener) => listener(message));
    });
  }

  public isConnected = () => this.connection.isConnected();

  public sendEvent = (message: unknown) => {
    const slot = this.connection.getMembership()?.slot;
    if (slot === undefined) return;
    this.connection.sendToSlot(slot, message as OnlineMessages);
  };

  public addListener = (listener: (message: OnlineMessages) => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  public removeListener = (listener: (message: OnlineMessages) => void) => {
    this.listeners.delete(listener);
  };

  public clearAllListeners = () => this.listeners.clear();

  public close = () => {
    this.detach?.();
    this.detach = null;
    this.listeners.clear();
  };
}
