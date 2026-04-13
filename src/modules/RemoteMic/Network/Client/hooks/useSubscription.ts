import { useEffect, useState } from 'react';
import { ChannelData, ChannelName, subscriptionManager } from '../subscriptions';

/** Subscribes to a push channel and returns the latest data, or undefined before the first push. */
export function useSubscription<C extends ChannelName>(channel: C): ChannelData<C> | undefined {
  const [data, setData] = useState<ChannelData<C> | undefined>(undefined);

  useEffect(() => {
    return subscriptionManager.subscribe(channel, setData);
  }, [channel]);

  return data;
}
