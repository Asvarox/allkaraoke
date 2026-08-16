import { AnySubscriptionChannels, RpcPublish } from './types';

export interface ServerSubscriptionRegistryOptions<TChannels extends AnySubscriptionChannels> {
  /** Values computed on demand for channels that have not been published to yet, so a peer
   * subscribing before the first publish still receives the current state. */
  fallbacks?: { [C in keyof TChannels]?: () => TChannels[C] };
}

/** Server-side half of the pub/sub channels: who subscribes to what, the last value published on
 * each channel, and the fan-out. Generic over the channel map so each feature (remote-mic, online)
 * can run its own instance with its own channels. */
export class ServerSubscriptionRegistry<TChannels extends AnySubscriptionChannels> {
  private subscribers = new Map<keyof TChannels, Set<string>>();
  // Stores the most-recently published value per channel so newly subscribing peers can receive
  // the current state immediately without waiting for the next change.
  private lastValues = new Map<keyof TChannels, unknown>();

  public constructor(private readonly options: ServerSubscriptionRegistryOptions<TChannels> = {}) {}

  public subscribe = (peerId: string, channel: keyof TChannels): void => {
    const subscribers = this.subscribers.get(channel);
    if (subscribers) {
      subscribers.add(peerId);
    } else {
      this.subscribers.set(channel, new Set([peerId]));
    }
  };

  public unsubscribe = (peerId: string, channel: keyof TChannels): void => {
    this.subscribers.get(channel)?.delete(peerId);
  };

  /** Drops a peer from every channel — call when its connection closes. */
  public removePeer = (peerId: string): void => {
    this.subscribers.forEach((subscribers) => subscribers.delete(peerId));
  };

  /** Caches `data` as the channel's latest value and hands the ready-made rpc-pub message to
   * `send` once per subscribed peer. */
  public publish = <C extends keyof TChannels>(
    channel: C,
    data: TChannels[C],
    send: (peerId: string, message: RpcPublish<TChannels>) => void,
  ): void => {
    this.setLastValue(channel, data);
    const subscribers = this.subscribers.get(channel);
    if (!subscribers?.size) return;
    const message = { t: 'rpc-pub', channel, data } as RpcPublish<TChannels>;
    subscribers.forEach((peerId) => send(peerId, message));
  };

  /** Records a published value without fanning it out — for hosts that keep their subscriber list
   * elsewhere and broadcast themselves (remote mic keeps its in `RemoteMicManager`). */
  public setLastValue = <C extends keyof TChannels>(channel: C, data: TChannels[C]): void => {
    this.lastValues.set(channel, data);
  };

  /** What a freshly subscribed peer should be replayed: the last published value, or the channel's
   * fallback when nothing has been published yet. `undefined` when there is nothing to replay — the
   * value comes wrapped so that a channel explicitly published as `undefined` still replays. */
  public getLastValue = <C extends keyof TChannels>(channel: C): { data: TChannels[C] } | undefined => {
    if (this.lastValues.has(channel)) {
      return { data: this.lastValues.get(channel) as TChannels[C] };
    }
    const fallback = this.options.fallbacks?.[channel];
    return fallback ? { data: fallback() } : undefined;
  };
}
