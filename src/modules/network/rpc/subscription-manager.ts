import { AnySubscriptionChannels } from './types';

type ChannelCallback<TChannels extends AnySubscriptionChannels, C extends keyof TChannels> = (
  data: TChannels[C],
) => void;

/** Manages pub/sub channel subscriptions on the client side. Tracks ref-counts, caches the latest
 * data per channel, and re-subscribes automatically after reconnect via `setSendFunctions`.
 * Generic over the channel map so each feature (remote-mic, online) can run its own instance. */
export class ClientSubscriptionManager<TChannels extends AnySubscriptionChannels> {
  private latestData: Partial<TChannels> = {};
  private callbacks = new Map<keyof TChannels, Set<ChannelCallback<TChannels, any>>>();

  private sendSubscribeFn: ((channel: keyof TChannels) => void) | null = null;
  private sendUnsubscribeFn: ((channel: keyof TChannels) => void) | null = null;

  /** Called by the network client after each successful connection to wire up the transport send functions.
   * Re-sends subscriptions for all currently active channels so the server is notified on reconnect. */
  public setSendFunctions = (
    sendSubscribe: (channel: keyof TChannels) => void,
    sendUnsubscribe: (channel: keyof TChannels) => void,
  ): void => {
    this.sendSubscribeFn = sendSubscribe;
    this.sendUnsubscribeFn = sendUnsubscribe;

    for (const channel of this.callbacks.keys()) {
      sendSubscribe(channel);
    }
  };

  /** Returns the latest cached data for a channel, or undefined before the first push. Stable
   * reference between publishes, so it can back `useSyncExternalStore`'s `getSnapshot`. */
  public getSnapshot = <C extends keyof TChannels>(channel: C): TChannels[C] | undefined => {
    return this.latestData[channel];
  };

  /** Subscribe to a channel. Delivers cached data immediately if available. Returns an unsubscribe function. */
  public subscribe = <C extends keyof TChannels>(channel: C, callback: ChannelCallback<TChannels, C>): (() => void) => {
    let channelCallbacks = this.callbacks.get(channel);
    if (!channelCallbacks) {
      channelCallbacks = new Set();
      this.callbacks.set(channel, channelCallbacks);
      this.sendSubscribeFn?.(channel);
    }
    channelCallbacks.add(callback as ChannelCallback<TChannels, any>);

    if (channel in this.latestData) {
      callback(this.latestData[channel] as TChannels[C]);
    }

    return () => this.unsubscribeInternal(channel, callback);
  };

  private unsubscribeInternal = <C extends keyof TChannels>(
    channel: C,
    callback: ChannelCallback<TChannels, C>,
  ): void => {
    const channelCallbacks = this.callbacks.get(channel);
    if (!channelCallbacks) return;
    channelCallbacks.delete(callback as ChannelCallback<TChannels, any>);
    if (channelCallbacks.size === 0) {
      this.callbacks.delete(channel);
      this.sendUnsubscribeFn?.(channel);
    }
  };

  /** Called by the network client when an rpc-pub message arrives; caches data and notifies subscribers. */
  public handlePublish = <C extends keyof TChannels>(channel: C, data: TChannels[C]): void => {
    this.latestData[channel] = data;
    this.callbacks.get(channel)?.forEach((callback) => callback(data));
  };
}
