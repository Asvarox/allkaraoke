import { transportCloseReason, transportErrorReason } from '~/modules/remote-mic/network/client/network-client';
import { NetworkMessages } from '~/modules/remote-mic/network/messages';
import Listener from '~/modules/utils/listener';

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
