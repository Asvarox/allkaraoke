import { transportCloseReason, transportErrorReason } from 'RemoteMic/Network/Client/NetworkClient';
import { NetworkMessages } from 'RemoteMic/Network/messages';
import Listener from 'utils/Listener';

export interface ClientTransport extends Listener<[NetworkMessages]> {
  connect(
    clientId: string,
    roomId: string,
    onConnect: () => void,
    onClose: (reason: transportCloseReason, originalEvent: any) => void,
    onError: (error: transportErrorReason, originalEvent: any) => void,
  ): void;

  sendEvent(event: NetworkMessages): void;

  isConnected(): boolean;

  close(): void;
}
