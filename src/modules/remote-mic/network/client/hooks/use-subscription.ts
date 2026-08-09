import { createSubscriptionHook } from '~/modules/network/rpc/use-subscription-factory';

import { subscriptionManager } from '../subscriptions';

/** Subscribes to a push channel and returns the latest data, or undefined before the first push. */
export const useSubscription = createSubscriptionHook(subscriptionManager);
