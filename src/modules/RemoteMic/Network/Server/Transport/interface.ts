import { NetworkMessages } from 'modules/RemoteMic/Network/messages';
import Listener from 'modules/utils/Listener';

export interface SenderInterface {
  peer: string;

  send(payload: NetworkMessages): void;

  on(event: string, callback: (data: any) => void): void;

  off(event: string, callback: (data: any) => void): void;

  close(): void;
}

export type transportCloseReason = string;
export type transportErrorReason = string;

export interface ServerTransport extends Listener<[NetworkMessages, SenderInterface]> {
  name: 'WebSockets' | 'PeerJS';

  connect(
    roomId: string,
    onConnect: () => void,
    onClose: (reason: transportCloseReason, originalEvent: any) => void,
  ): void;

  disconnect(): void;

  getCurrentPing(): number;
}
