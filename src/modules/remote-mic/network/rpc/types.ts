import { SubscriptionChannels } from '../client/subscriptions';

/** Context passed to every server-side handler, scoped to the calling peer. */
export interface RpcContext {
  senderId: string;
  permission: 'read' | 'write';
  /** Forcibly removes a peer from the transport. */
  removePlayer: (peerId: string) => void;
}

/** A read-only server handler that returns data without side effects. */
export interface QueryDefinition<TArgs extends any[], TReturn> {
  type: 'query';
  permission: 'read' | 'write';
  handler: (context: RpcContext, ...args: TArgs) => TReturn | Promise<TReturn>;
}

/** A server handler that performs a side-effecting operation. */
export interface MutationDefinition<TArgs extends any[], TReturn = void> {
  type: 'mutation';
  permission: 'read' | 'write';
  handler: (context: RpcContext, ...args: TArgs) => TReturn | Promise<TReturn>;
}

export type AnyDefinition = QueryDefinition<any[], any> | MutationDefinition<any[], any>;

export type HandlerMap = Record<string, Record<string, AnyDefinition>>;

/** Strips the RpcContext first parameter and wraps the return in Promise, deriving the client-facing call signature. */
type StripContext<H> = H extends (context: RpcContext, ...args: infer A) => infer R
  ? (...args: A) => Promise<Awaited<R>>
  : never;

/** Derives the typed client proxy contract from a server HandlerMap. */
export type ExtractContract<T extends HandlerMap> = {
  [NS in keyof T]: {
    [M in keyof T[NS]]: StripContext<T[NS][M]['handler']>;
  };
};

// --- Wire message types ---

/** Client → Server: invoke a server handler. */
export interface RpcRequest {
  t: 'rpc';
  ns: string;
  method: string;
  args: any[];
  id: string;
}

/** Server → Client: response to an RpcRequest. */
export interface RpcResponse {
  t: 'rpc-res';
  id: string;
  result?: any;
  error?: string;
}

/** Server → Client: server-initiated call to a client handler. */
export interface RpcCall {
  t: 'rpc-call';
  method: string;
  args: any[];
}

/** Client → Server: subscribe to a named push channel. */
export interface RpcSubscribe {
  t: 'rpc-sub';
  channel: keyof SubscriptionChannels;
}

/** Server → Client: push updated data to all subscribers of a channel. */
export interface RpcPublish {
  t: 'rpc-pub';
  channel: keyof SubscriptionChannels;
  data: SubscriptionChannels[keyof SubscriptionChannels];
}

/** Client → Server: unsubscribe from a named push channel. */
export interface RpcUnsubscribe {
  t: 'rpc-unsub';
  channel: keyof SubscriptionChannels;
}

export type RpcMessages = RpcRequest | RpcResponse | RpcCall | RpcSubscribe | RpcPublish | RpcUnsubscribe;
