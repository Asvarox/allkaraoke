import { createSubscriptionHook } from '~/modules/remote-mic/network/rpc/subscription-manager';

import { subscriptionManager } from '../subscriptions';

/** Subscribes to a push channel and returns the latest data, or undefined before the first push. */
export const useSubscription = createSubscriptionHook(subscriptionManager);
