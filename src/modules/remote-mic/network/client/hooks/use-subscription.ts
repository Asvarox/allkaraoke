import { useCallback, useSyncExternalStore } from 'react';
import { ChannelData, ChannelName, subscriptionManager } from '../subscriptions';

/** Subscribes to a push channel and returns the latest data, or undefined before the first push. */
export function useSubscription<C extends ChannelName>(channel: C): ChannelData<C> | undefined {
  const subscribe = useCallback(
    (onStoreChange: () => void) => subscriptionManager.subscribe(channel, onStoreChange),
    [channel],
  );
  const getSnapshot = useCallback(() => subscriptionManager.getSnapshot(channel), [channel]);

  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
