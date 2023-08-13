import { SenderInterface, ServerTransport, transportCloseReason } from 'RemoteMic/Network/Server/Transport/interface';
import { WebRTCEvents } from 'RemoteMic/Network/events';
import { pack, unpack } from 'RemoteMic/Network/utils';
import Listener from 'utils/Listener';

export interface ForwardedMessage {
    t: 'forward';
    sender: string;
    payload: WebRTCEvents;
}

interface WebsocketConnectedMessage {
    t: 'connected';
}

export type WebsocketMessage = ForwardedMessage | WebsocketConnectedMessage;

export const WEBSOCKETS_SERVER = import.meta.env.VITE_APP_WEBSOCKET_URL;

export class WebSocketServerTransport extends Listener<[WebRTCEvents, SenderInterface]> implements ServerTransport {
    public readonly name = 'WebSockets';
    private connection: WebSocket | null = null;

    public constructor(private pswd: string) {
        super();
    }

    public connect(
        roomId: string,
        onConnect: () => void,
        onClose: (reason: transportCloseReason, originalEvent: any) => void,
    ) {
        this.connection = new WebSocket(WEBSOCKETS_SERVER);
        this.connection.binaryType = 'arraybuffer';
        this.connection.onopen = () => {
            this.connection?.send(pack({ t: 'register-room', id: roomId, pswd: this.pswd }));
            onConnect();

            this.connection?.addEventListener('message', (message) => {
                const payload: WebsocketMessage = unpack(message.data);

                // @ts-ignore
                if (!['ping', 'pong', 'freq'].includes(payload?.payload?.t)) console.log('received', payload);

                if (payload.t === 'forward') {
                    const { sender, payload: data } = payload;
                    const conn = new SenderWrapper(sender, this.connection!);

                    this.onUpdate(data, conn);
                }
            });
        };
    }

    public disconnect = () => {
        this.connection?.close();
    };
}

type callback = (data: any) => void;

class SenderWrapper implements SenderInterface {
    constructor(public peer: string, private socket: WebSocket) {}

    public send = (payload: WebRTCEvents) => {
        const data = { t: 'forward', recipients: [this.peer], payload };
        if (!['ping', 'pong', 'freq'].includes(payload?.t)) console.log('sending', this.peer, payload);
        this.socket.send(pack(data));
    };

    private callbacksMap: Map<callback, callback> = new Map();

    public on = (event: string, callback: (data: any) => void) => {
        if (event === 'data') {
            this.callbacksMap.set(callback, (message) => {
                const data: WebsocketMessage = unpack(message.data);
                if (data.t === 'forward') {
                    const { sender, payload } = data;
                    if (sender === this.peer) {
                        callback(payload);
                    }
                }
            });
            this.socket.addEventListener('message', this.callbacksMap.get(callback)!);
        }
    };

    public off = (event: string, callback: (data: any) => void) => {
        if (event === 'data') {
            const actualCallback = this.callbacksMap.get(callback);
            this.socket.removeEventListener('message', actualCallback!);
            this.callbacksMap.delete(callback);
        }
    };

    public close = () => {
        this.socket.close();
    };
}
