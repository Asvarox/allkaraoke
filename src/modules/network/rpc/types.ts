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

/** Map of channel name → data type pushed on that channel. Each feature (remote-mic, online)
 * supplies its own map so the RPC core stays feature-agnostic. */
export type AnySubscriptionChannels = Record<string, unknown>;

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
export interface RpcSubscribe<TChannels extends AnySubscriptionChannels = AnySubscriptionChannels> {
  t: 'rpc-sub';
  channel: keyof TChannels;
}

/** Server → Client: push updated data to all subscribers of a channel. */
export interface RpcPublish<TChannels extends AnySubscriptionChannels = AnySubscriptionChannels> {
  t: 'rpc-pub';
  channel: keyof TChannels;
  data: TChannels[keyof TChannels];
}

/** Client → Server: unsubscribe from a named push channel. */
export interface RpcUnsubscribe<TChannels extends AnySubscriptionChannels = AnySubscriptionChannels> {
  t: 'rpc-unsub';
  channel: keyof TChannels;
}

export type RpcMessages<TChannels extends AnySubscriptionChannels = AnySubscriptionChannels> =
  | RpcRequest
  | RpcResponse
  | RpcCall
  | RpcSubscribe<TChannels>
  | RpcPublish<TChannels>
  | RpcUnsubscribe<TChannels>;
