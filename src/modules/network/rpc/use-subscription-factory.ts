import { useCallback, useSyncExternalStore } from 'react';

import { ClientSubscriptionManager } from './subscription-manager';
import { AnySubscriptionChannels } from './types';

/** Builds the React hook that reads a channel off a specific manager instance. Reading the cache
 * through `useSyncExternalStore` means a mounting subscriber renders the latest value right away,
 * instead of rendering empty and catching up one state update later. Each feature (remote-mic,
 * online) creates the hook once for its own manager.
 *
 * Lives apart from the manager itself so the transport core stays React-free — the server side of
 * it is bundled into the PartyKit worker. */
export const createSubscriptionHook = <TChannels extends AnySubscriptionChannels>(
  manager: ClientSubscriptionManager<TChannels>,
) =>
  /** Subscribes to a push channel and returns the latest data, or undefined before the first push. */
  function useSubscription<C extends keyof TChannels>(channel: C): TChannels[C] | undefined {
    const subscribe = useCallback((onStoreChange: () => void) => manager.subscribe(channel, onStoreChange), [channel]);
    const getSnapshot = useCallback(() => manager.getSnapshot(channel), [channel]);

    return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  };
