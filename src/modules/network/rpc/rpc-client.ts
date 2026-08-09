import { v4 as uuid } from 'uuid';

import { ExtractContract, HandlerMap, RpcRequest, RpcResponse } from './types';

/** Minimal transport shape the RPC proxy needs. remote-mic's ClientTransport and the online
 * room transport both satisfy it structurally, each with their own message unions. */
export interface RpcClientTransport {
  isConnected(): boolean;
  addListener(listener: (message: any) => void): unknown;
  removeListener(listener: (message: any) => void): void;
  sendEvent(message: any): void;
}

/** Fire-and-forget mirror of a client contract: same arguments, no result, rejections swallowed. */
export type FireAndForgetContract<T> = {
  [NS in keyof T]: {
    [M in keyof T[NS]]: T[NS][M] extends (...args: infer A) => unknown ? (...args: A) => void : never;
  };
};

type AsyncNamespaces = Record<string, Record<string, (...args: never[]) => Promise<unknown>>>;

/**
 * Wraps an RPC proxy so every call is fire-and-forget: nothing to await, and a rejection
 * (disconnect, timeout, server error) is swallowed instead of surfacing as an unhandled rejection.
 * Use it for calls whose result nobody reads; keep the plain `rpc` proxy when the answer matters.
 */
export function createFireAndForgetProxy<T extends object>(rpc: T): FireAndForgetContract<T> {
  return new Proxy({} as FireAndForgetContract<T>, {
    get(_target, ns: string) {
      const namespace = (rpc as AsyncNamespaces)[ns];
      return new Proxy(
        {},
        {
          get(_nsTarget, method: string) {
            return (...args: never[]) => {
              void namespace[method](...args).catch(() => undefined);
            };
          },
        },
      );
    },
  });
}

/**
 * Creates a namespaced proxy that mirrors the server handler contract.
 * Property access returns a sub-proxy for a namespace; method calls serialize to
 * RpcRequest messages and return a Promise resolved with the server response (10 s timeout).
 *
 * @param getTransport - Returns the active transport (or undefined when disconnected).
 * @param onDisconnect - Registers a one-shot callback that fires when the connection drops.
 *   Must return an unsubscribe function so in-flight requests can clean up before the
 *   callback fires (e.g. when they already resolved via rpc-res).
 */
export function createRpcProxy<T extends HandlerMap>(
  getTransport: () => RpcClientTransport | undefined,
  onDisconnect: (callback: () => void) => () => void,
): ExtractContract<T> {
  return new Proxy({} as ExtractContract<T>, {
    get(_target, ns: string) {
      return new Proxy(
        {},
        {
          get(_nsTarget, method: string) {
            return (...args: any[]): Promise<any> => {
              const transport = getTransport();
              if (!transport?.isConnected()) {
                return Promise.reject(new Error(`Not connected (calling ${ns}.${method})`));
              }

              const id = uuid();

              return new Promise<any>((resolve, reject) => {
                const timeout = setTimeout(() => {
                  cleanup();
                  reject(new Error(`RPC timeout: ${ns}.${method}`));
                }, 10_000);

                const removeDisconnectListener = onDisconnect(() => {
                  cleanup();
                  reject(new Error(`Transport disconnected during RPC: ${ns}.${method}`));
                });

                const listener = (event: any) => {
                  if (event.t === 'rpc-res' && (event as RpcResponse).id === id) {
                    cleanup();
                    const response = event as RpcResponse;
                    if (response.error) {
                      reject(new Error(response.error));
                    } else {
                      resolve(response.result);
                    }
                  }
                };

                const cleanup = () => {
                  clearTimeout(timeout);
                  transport.removeListener(listener);
                  removeDisconnectListener();
                };

                transport.addListener(listener);

                const request: RpcRequest = { t: 'rpc', ns, method, args, id };
                try {
                  transport.sendEvent(request);
                } catch (err) {
                  cleanup();
                  reject(err instanceof Error ? err : new Error(String(err)));
                }
              });
            };
          },
        },
      );
    },
  });
}
