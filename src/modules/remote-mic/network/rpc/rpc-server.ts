import { AnyDefinition, HandlerMap, RpcContext, RpcRequest } from './types';

/** Minimal shape of a connected peer the RPC server can respond to. Both remote-mic's
 * SenderInterface and the online room's connection wrapper satisfy it structurally. */
export interface RpcSenderInterface {
  peer: string;
  send(payload: any): void;
}

/** Handles incoming RPC requests from clients: permission checks, dispatch, and response sending.
 * Feature-agnostic: the hosting server supplies permission lookup, subscription broadcast and
 * peer removal, and its own transport/message types. */
export class RpcServer<T extends HandlerMap> {
  constructor(
    private readonly handlers: T,
    private readonly getPermission: (peerId: string) => 'read' | 'write',
    private readonly broadcastToSubscribers: (channel: string, message: any) => void,
    private readonly removePlayerFromTransport: (peerId: string) => void,
  ) {}

  /** Validates, permission-checks, and dispatches an incoming RPC request, then sends the response. */
  public handleMessage = async (message: RpcRequest, sender: RpcSenderInterface): Promise<void> => {
    const namespace = this.handlers[message.ns];
    if (!namespace) {
      sender.send({ t: 'rpc-res', id: message.id, error: `Unknown namespace: ${message.ns}` });
      return;
    }

    const definition: AnyDefinition | undefined = namespace[message.method];
    if (!definition) {
      sender.send({
        t: 'rpc-res',
        id: message.id,
        error: `Unknown method: ${message.ns}.${message.method}`,
      });
      return;
    }

    const callerPermission = this.getPermission(sender.peer);
    // 'write' permission requirement blocks 'read' callers; 'read' allows everyone
    if (definition.permission === 'write' && callerPermission !== 'write') {
      sender.send({ t: 'rpc-res', id: message.id, error: 'Permission denied' });
      return;
    }

    const context: RpcContext = {
      senderId: sender.peer,
      permission: callerPermission,
      removePlayer: (peerId) => this.removePlayerFromTransport(peerId),
    };

    try {
      const result = await definition.handler(context, ...message.args);
      sender.send({ t: 'rpc-res', id: message.id, result });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      sender.send({ t: 'rpc-res', id: message.id, error: errorMessage });
    }
  };

  /** Push data to all clients subscribed to a channel. */
  public publish = (channel: string, data: unknown): void => {
    this.broadcastToSubscribers(channel, { t: 'rpc-pub', channel, data });
  };

  /** Send a server-initiated call to a specific client. */
  public callClient = (sender: RpcSenderInterface, method: string, ...args: unknown[]): void => {
    sender.send({ t: 'rpc-call', method, args });
  };

  /** Send a server-initiated call to every currently connected client. */
  public broadcastClientCall = (
    connections: ReadonlyArray<{ connection: RpcSenderInterface }>,
    method: string,
    ...args: unknown[]
  ): void => {
    connections.forEach(({ connection }) => {
      connection.send({ t: 'rpc-call', method, args });
    });
  };

  /** Forcibly disconnect a peer from the transport. */
  public removePlayer = (peerId: string): void => {
    this.removePlayerFromTransport(peerId);
  };
}
