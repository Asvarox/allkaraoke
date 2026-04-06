import { ClientContract } from './clientContract';

/** Module-level registry mapping each ClientContract method to its active handlers. */
const registry = new Map<keyof ClientContract, Set<(...args: any[]) => void>>();

/** Registers a handler for a server-initiated call. Returns an unregister function. */
export function registerClientHandler<M extends keyof ClientContract>(
  method: M,
  handler: ClientContract[M],
): () => void {
  if (!registry.has(method)) {
    registry.set(method, new Set());
  }
  registry.get(method)!.add(handler as (...args: any[]) => void);

  return () => {
    registry.get(method)?.delete(handler as (...args: any[]) => void);
  };
}

/** Invokes all handlers registered for the given method. Warns if none are registered. */
export function dispatchClientCall(method: string, args: any[]): void {
  const handlers = registry.get(method as keyof ClientContract);
  if (!handlers || handlers.size === 0) {
    console.warn(`RPC: No client handler registered for '${method}'`);
    return;
  }
  handlers.forEach((handler) => handler(...args));
}
