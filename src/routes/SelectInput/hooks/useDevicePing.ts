import RemoteMicManager from 'modules/RemoteMic/RemoteMicManager';
import { useEffect, useState } from 'react';

export const useDevicePing = (deviceId?: string) => {
  const [latency, setLatency] = useState<number | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      const remoteMic = RemoteMicManager.getRemoteMicById(deviceId ?? '');

      setLatency(remoteMic ? remoteMic.getLatency() : null);
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [deviceId]);

  return latency;
};
