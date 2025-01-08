import events from 'modules/GameEvents/GameEvents';
import { useEventEffect, useEventListenerSelector } from 'modules/GameEvents/hooks';
import server from 'modules/RemoteMic/Network/Server';
import remoteMicManager from 'modules/RemoteMic/RemoteMicManager';
import { useState } from 'react';
import { useInterval } from 'react-use';

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
