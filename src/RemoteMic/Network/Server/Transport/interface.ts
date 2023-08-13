import { WebRTCEvents } from 'RemoteMic/Network/events';
import Listener from 'utils/Listener';

export interface SenderInterface {
    peer: string;

    send(payload: WebRTCEvents): void;

    on(event: string, callback: (data: any) => void): void;

    off(event: string, callback: (data: any) => void): void;

    close(): void;
}

export type transportCloseReason = string;
export type transportErrorReason = string;

export interface ServerTransport extends Listener<[WebRTCEvents, SenderInterface]> {
    name: 'WebSockets' | 'PeerJS';

    connect(
        roomId: string,
        onConnect: () => void,
        onClose: (reason: transportCloseReason, originalEvent: any) => void,
    ): void;

    disconnect(): void;
}
