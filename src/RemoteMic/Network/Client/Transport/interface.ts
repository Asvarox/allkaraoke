import { transportCloseReason, transportErrorReason } from 'RemoteMic/Network/Client/NetworkClient';
import { WebRTCEvents } from 'RemoteMic/Network/events';
import Listener from 'utils/Listener';

export interface ClientTransport extends Listener<[WebRTCEvents]> {
    connect(
        clientId: string,
        roomId: string,
        onConnect: () => void,
        onClose: (reason: transportCloseReason, originalEvent: any) => void,
        onError: (error: transportErrorReason, originalEvent: any) => void,
    ): void;

    sendEvent(event: WebRTCEvents): void;

    isConnected(): boolean;

    close(): void;
}
