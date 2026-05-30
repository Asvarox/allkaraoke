import { backgroundTheme } from '~/modules/elements/layout-with-background';
import { HelpEntry } from '~/routes/keyboard-help/context';

/** Typed subscription channels and the data type pushed for each channel. */
export interface SubscriptionChannels {
  'remote-mics': Array<{ id: string; name: string; number: 0 | 1 | 2 | 3 | null }>;
  'keyboard-layout': HelpEntry | undefined;
  style: backgroundTheme;
}

export type ChannelName = keyof SubscriptionChannels;
export type ChannelData<C extends ChannelName> = SubscriptionChannels[C];

type ChannelCallback<C extends ChannelName> = (data: ChannelData<C>) => void;

/** Manages pub/sub channel subscriptions on the client side. Tracks ref-counts, caches the latest
 * data per channel, and re-subscribes automatically after reconnect via `setSendFunctions`. */
export class ClientSubscriptionManager {
  private subscriberCounts: Partial<Record<ChannelName, number>> = {};
  private latestData: Partial<SubscriptionChannels> = {};
  private callbacks = new Map<ChannelName, Set<ChannelCallback<any>>>();

  private sendSubscribeFn: ((channel: ChannelName) => void) | null = null;
  private sendUnsubscribeFn: ((channel: ChannelName) => void) | null = null;

  /** Called by NetworkClient after each successful connection to wire up the transport send functions.
   * Re-sends subscriptions for all currently active channels so the server is notified on reconnect. */
  public setSendFunctions = (
    sendSubscribe: (channel: ChannelName) => void,
    sendUnsubscribe: (channel: ChannelName) => void,
  ): void => {
    this.sendSubscribeFn = sendSubscribe;
    this.sendUnsubscribeFn = sendUnsubscribe;

    for (const [channel, count] of Object.entries(this.subscriberCounts) as [ChannelName, number][]) {
      if (count > 0) {
        sendSubscribe(channel);
      }
    }
  };

  /** Subscribe to a channel. Delivers cached data immediately if available. Returns an unsubscribe function. */
  public subscribe = <C extends ChannelName>(channel: C, callback: ChannelCallback<C>): (() => void) => {
    const count = this.subscriberCounts[channel] ?? 0;
    if (count === 0) {
      this.sendSubscribeFn?.(channel);
    }
    this.subscriberCounts[channel] = count + 1;

    if (!this.callbacks.has(channel)) {
      this.callbacks.set(channel, new Set());
    }
    this.callbacks.get(channel)!.add(callback as ChannelCallback<any>);

    if (channel in this.latestData) {
      callback(this.latestData[channel] as ChannelData<C>);
    }

    return () => this.unsubscribeInternal(channel, callback);
  };

  private unsubscribeInternal = <C extends ChannelName>(channel: C, callback: ChannelCallback<C>): void => {
    this.callbacks.get(channel)?.delete(callback as ChannelCallback<any>);
    const count = this.subscriberCounts[channel] ?? 0;
    if (count <= 1) {
      this.subscriberCounts[channel] = 0;
      this.sendUnsubscribeFn?.(channel);
    } else {
      this.subscriberCounts[channel] = count - 1;
    }
  };

  /** Called by NetworkClient when an rpc-pub message arrives; caches data and notifies subscribers. */
  public handlePublish = <C extends ChannelName>(channel: C, data: ChannelData<C>): void => {
    this.latestData[channel] = data;
    this.callbacks.get(channel)?.forEach((callback) => callback(data));
  };
}

/** Singleton used by hooks and NetworkClient. */
export const subscriptionManager = new ClientSubscriptionManager();
