import { transportCloseReason, transportErrorReason } from 'modules/RemoteMic/Network/Client/NetworkClient';
import { NetworkMessages } from 'modules/RemoteMic/Network/messages';
import Listener from 'modules/utils/Listener';

export interface ClientTransport extends Listener<[NetworkMessages]> {
  connect(
    clientId: string,
    roomId: string,
    onConnect: () => void,
    onClose: (reason: transportCloseReason, originalEvent: unknown) => void,
    onError: (error: transportErrorReason, originalEvent: unknown) => void,
  ): void;

  sendEvent(event: NetworkMessages): void;

  isConnected(): boolean;

  close(): void;
}
