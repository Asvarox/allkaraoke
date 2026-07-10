import { backgroundTheme } from '~/modules/elements/layout-with-background';
import { PlayerNumber } from '~/modules/players/player-number';
import { ClientSubscriptionManager } from '~/modules/remote-mic/network/rpc/subscription-manager';
import { HelpEntry } from '~/routes/keyboard-help/context';

/** Typed subscription channels and the data type pushed for each channel.
 * A type alias (not interface) so it satisfies the RPC core's AnySubscriptionChannels constraint. */
export type SubscriptionChannels = {
  'remote-mics': Array<{ id: string; name: string; number: PlayerNumber | null }>;
  'keyboard-layout': HelpEntry | undefined;
  style: backgroundTheme;
};

export type ChannelName = keyof SubscriptionChannels;
export type ChannelData<C extends ChannelName> = SubscriptionChannels[C];

/** Singleton used by remote-mic hooks and NetworkClient. */
export const subscriptionManager = new ClientSubscriptionManager<SubscriptionChannels>();
