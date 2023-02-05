import { DataConnection } from 'peerjs';
import { WebRTCEvents } from 'RemoteMic/Network/events';

function sendEvent<T extends WebRTCEvents>(
    connection: DataConnection | null | undefined,
    type: T['type'],
    payload?: Omit<T, 'type'>,
) {
    connection?.send({ type, ...payload });
}

export default sendEvent;
