import WebRTCClient from 'RemoteMic/Network/WebRTCClient';
import { getPingTime } from 'RemoteMic/Network/utils';
import { useEffect, useState } from 'react';

interface Props {}

function Ping({}: Props) {
    const [latency, setLatency] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            const now = getPingTime();
            if (WebRTCClient.pinging && now - WebRTCClient.pingStart > latency) {
                setLatency(now - WebRTCClient.pingStart);
            } else {
                setLatency(WebRTCClient.latency);
            }
        }, 333);

        return () => {
            clearInterval(interval);
        };
    }, []);
    return <>{latency}ms</>;
}
export default Ping;
