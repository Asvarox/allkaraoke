import { useEffect, useState } from 'react';
import RemoteMicClient from '~/modules/remote-mic/network/client';
import { getPingTime } from '~/modules/remote-mic/network/utils';

function Ping() {
  const [latency, setLatency] = useState(RemoteMicClient.latency);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = getPingTime();
      if (RemoteMicClient.pinging && now - RemoteMicClient.pingStart > latency) {
        setLatency(now - RemoteMicClient.pingStart);
      } else {
        setLatency(RemoteMicClient.latency);
      }
    }, 333);

    return () => {
      clearInterval(interval);
    };
  }, []);
  return <>{latency}ms</>;
}
export default Ping;
