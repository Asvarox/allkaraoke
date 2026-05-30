import { useState } from 'react';
import { useInterval } from 'react-use';
import events from '~/modules/game-events/game-events';
import { useEventEffect, useEventListenerSelector } from '~/modules/game-events/hooks';
import server from '~/modules/remote-mic/network/server';
import remoteMicManager from '~/modules/remote-mic/remote-mic-manager';

export default function useRemoteMicServerStatus() {
  const [isOnline, setIsOnline] = useState(() => server.isStarted());
  const [latency, setLatency] = useState<number | null>(() => server.getLatency());

  useInterval(() => {
    setLatency(server.getLatency());
  }, 1000);

  useEventEffect(events.micServerStarted, () => {
    setIsOnline(true);
  });

  useEventEffect(events.micServerStopped, () => {
    setIsOnline(false);
  });

  const connected = useEventListenerSelector(
    [events.remoteMicConnected, events.remoteMicDisconnected],
    () => remoteMicManager.getRemoteMics(),
    [isOnline],
  );
  return {
    isOnline,
    latency,
    connected,
  };
}
