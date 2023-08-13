import { WebRTCEvents } from 'RemoteMic/Network/events';
import { SenderInterface } from 'RemoteMic/Network/Server/Transport/interface';

function sendMessage<T extends WebRTCEvents>(
    connection: SenderInterface | null | undefined,
    type: T['t'],
    payload?: Omit<T, 't'>,
) {
    connection?.send({ t: type, ...payload } as WebRTCEvents);
}

export default sendMessage;
