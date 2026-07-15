import { NetworkMessages } from '~/modules/remote-mic/network/messages';
import { SenderInterface } from '~/modules/remote-mic/network/server/transport/interface';

import { AnyDefinition, HandlerMap, RpcContext, RpcRequest } from './types';

/** Handles incoming RPC requests from clients: permission checks, dispatch, and response sending. */
export class RpcServer<T extends HandlerMap> {
  constructor(
    private readonly handlers: T,
    private readonly getPermission: (peerId: string) => 'read' | 'write',
    private readonly broadcastToSubscribers: (channel: string, message: NetworkMessages) => void,
    private readonly removePlayerFromTransport: (peerId: string) => void,
  ) {}

  /** Validates, permission-checks, and dispatches an incoming RPC request, then sends the response. */
  public handleMessage = async (message: RpcRequest, sender: SenderInterface): Promise<void> => {
    const namespace = this.handlers[message.ns];
    if (!namespace) {
      sender.send({ t: 'rpc-res', id: message.id, error: `Unknown namespace: ${message.ns}` } as NetworkMessages);
      return;
    }

    const definition: AnyDefinition | undefined = namespace[message.method];
    if (!definition) {
      sender.send({
        t: 'rpc-res',
        id: message.id,
        error: `Unknown method: ${message.ns}.${message.method}`,
      } as NetworkMessages);
      return;
    }

    const callerPermission = this.getPermission(sender.peer);
    // 'write' permission requirement blocks 'read' callers; 'read' allows everyone
    if (definition.permission === 'write' && callerPermission !== 'write') {
      sender.send({ t: 'rpc-res', id: message.id, error: 'Permission denied' } as NetworkMessages);
      return;
    }

    const context: RpcContext = {
      senderId: sender.peer,
      permission: callerPermission,
      removePlayer: (peerId) => this.removePlayerFromTransport(peerId),
    };

    try {
      const result = await definition.handler(context, ...message.args);
      sender.send({ t: 'rpc-res', id: message.id, result } as NetworkMessages);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      sender.send({ t: 'rpc-res', id: message.id, error: errorMessage } as NetworkMessages);
    }
  };

  /** Push data to all clients subscribed to a channel. */
  public publish = (channel: string, data: unknown): void => {
    this.broadcastToSubscribers(channel, { t: 'rpc-pub', channel, data } as NetworkMessages);
  };

  /** Send a server-initiated call to a specific client. */
  public callClient = (sender: SenderInterface, method: string, ...args: unknown[]): void => {
    sender.send({ t: 'rpc-call', method, args } as NetworkMessages);
  };

  /** Send a server-initiated call to every currently connected client. */
  public broadcastClientCall = (
    connections: ReadonlyArray<{ connection: SenderInterface }>,
    method: string,
    ...args: unknown[]
  ): void => {
    connections.forEach(({ connection }) => {
      connection.send({ t: 'rpc-call', method, args } as NetworkMessages);
    });
  };

  /** Forcibly disconnect a peer from the transport. */
  public removePlayer = (peerId: string): void => {
    this.removePlayerFromTransport(peerId);
  };
}
