import { useEffect, useRef } from 'react';
import { ClientContract } from '../client-contract';
import { registerClientHandler } from '../client-handlers';

/** Registers a handler for a server-initiated RPC call. Auto-unregisters on unmount; uses a ref so the latest handler is always called. */
export function useClientHandler<M extends keyof ClientContract>(method: M, handler: ClientContract[M]): void {
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    const stableHandler = ((...args: any[]) => (handlerRef.current as any)(...args)) as ClientContract[M];
    return registerClientHandler(method, stableHandler);
  }, [method]);
}
