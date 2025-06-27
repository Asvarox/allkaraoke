import RemoteMicClient from 'modules/RemoteMic/Network/Client';
import { getPingTime } from 'modules/RemoteMic/Network/utils';
import { useEffect, useState } from 'react';

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
