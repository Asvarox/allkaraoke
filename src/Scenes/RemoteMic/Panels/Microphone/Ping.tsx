import RemoteMicClient from 'RemoteMic/Network/Client';
import { getPingTime } from 'RemoteMic/Network/utils';
import { useEffect, useState } from 'react';

interface Props {}

function Ping({}: Props) {
    const [latency, setLatency] = useState(0);

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
