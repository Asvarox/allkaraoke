import { DataConnection } from 'peerjs';
import { WebRTCEvents } from 'RemoteMic/Network/events';

function sendEvent<T extends WebRTCEvents>(
    connection: DataConnection | null | undefined,
    type: T['t'],
    payload?: Omit<T, 't'>,
) {
    connection?.send({ t: type, ...payload });
}

export default sendEvent;
