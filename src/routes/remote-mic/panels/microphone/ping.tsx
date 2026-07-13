import { useEffect, useState } from 'react';
import RemoteMicClient from '~/modules/remote-mic/network/client';
import { getPingTime } from '~/modules/remote-mic/network/utils';

function Ping() {
  const [latency, setLatency] = useState(RemoteMicClient.latency);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = getPingTime();
      setLatency((current) => {
        if (RemoteMicClient.pinging && now - RemoteMicClient.pingStart > current) {
          return now - RemoteMicClient.pingStart;
        }
        return RemoteMicClient.latency;
      });
    }, 333);

    return () => {
      clearInterval(interval);
    };
  }, []);
  return <>{latency}ms</>;
}
export default Ping;
