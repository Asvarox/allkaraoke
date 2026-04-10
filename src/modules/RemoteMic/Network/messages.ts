import { Params } from '~/modules/hooks/useKeyboard';
import { RpcMessages } from '~/modules/RemoteMic/Network/Rpc/types';

export interface NetworkRegisterMessage {
  t: 'register';
  id: string;
  name: string;
  silent: boolean;
  lag: number;
}

export interface NetworkUnregisterMessage {
  t: 'unregister';
}

export interface NetworkRegisterRoomMessage {
  t: 'register-room';
  id: string;
}

export interface NetworkNewFrequencyMessage {
  t: 'freq';
  0: number[]; // frequencies
  1: number; // volume
}

export type keyStrokes = keyof Params;

export interface NetworkPingMessageEvent {
  t: 'ping';
}
export interface NetworkPongMessageEvent {
  t: 'pong';
}

export interface NetworkRemovePlayerMessage {
  t: 'remove-player';
  id: string;
}

export type NetworkMessages =
  | NetworkRegisterMessage
  | NetworkUnregisterMessage
  | NetworkRegisterRoomMessage
  | NetworkNewFrequencyMessage
  | NetworkPingMessageEvent
  | NetworkPongMessageEvent
  | NetworkRemovePlayerMessage
  | RpcMessages;
