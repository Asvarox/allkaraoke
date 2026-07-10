import { AnySubscriptionChannels } from './types';

type ChannelCallback<TChannels extends AnySubscriptionChannels, C extends keyof TChannels> = (
  data: TChannels[C],
) => void;

/** Manages pub/sub channel subscriptions on the client side. Tracks ref-counts, caches the latest
 * data per channel, and re-subscribes automatically after reconnect via `setSendFunctions`.
 * Generic over the channel map so each feature (remote-mic, online) can run its own instance. */
export class ClientSubscriptionManager<TChannels extends AnySubscriptionChannels> {
  private subscriberCounts: Partial<Record<keyof TChannels, number>> = {};
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

    for (const [channel, count] of Object.entries(this.subscriberCounts) as [keyof TChannels, number][]) {
      if (count > 0) {
        sendSubscribe(channel);
      }
    }
  };

  /** Subscribe to a channel. Delivers cached data immediately if available. Returns an unsubscribe function. */
  public subscribe = <C extends keyof TChannels>(channel: C, callback: ChannelCallback<TChannels, C>): (() => void) => {
    const count = this.subscriberCounts[channel] ?? 0;
    if (count === 0) {
      this.sendSubscribeFn?.(channel);
    }
    this.subscriberCounts[channel] = count + 1;

    if (!this.callbacks.has(channel)) {
      this.callbacks.set(channel, new Set());
    }
    this.callbacks.get(channel)!.add(callback as ChannelCallback<TChannels, any>);

    if (channel in this.latestData) {
      callback(this.latestData[channel] as TChannels[C]);
    }

    return () => this.unsubscribeInternal(channel, callback);
  };

  private unsubscribeInternal = <C extends keyof TChannels>(
    channel: C,
    callback: ChannelCallback<TChannels, C>,
  ): void => {
    this.callbacks.get(channel)?.delete(callback as ChannelCallback<TChannels, any>);
    const count = this.subscriberCounts[channel] ?? 0;
    if (count <= 1) {
      this.subscriberCounts[channel] = 0;
      this.sendUnsubscribeFn?.(channel);
    } else {
      this.subscriberCounts[channel] = count - 1;
    }
  };

  /** Called by the network client when an rpc-pub message arrives; caches data and notifies subscribers. */
  public handlePublish = <C extends keyof TChannels>(channel: C, data: TChannels[C]): void => {
    this.latestData[channel] = data;
    this.callbacks.get(channel)?.forEach((callback) => callback(data));
  };
}
