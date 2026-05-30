import { v4 as uuid } from 'uuid';
import { ClientTransport } from '~/modules/remote-mic/network/client/transport/interface';
import { NetworkMessages } from '~/modules/remote-mic/network/messages';
import { ExtractContract, HandlerMap, RpcRequest, RpcResponse } from './types';

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
  getTransport: () => ClientTransport | undefined,
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

                const listener = (event: NetworkMessages) => {
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
                  transport.sendEvent(request as NetworkMessages);
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
