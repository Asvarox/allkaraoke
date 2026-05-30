import { MutationDefinition, QueryDefinition, RpcContext } from './types';

/** Declares a read-only server handler. Defaults to 'read' permission. */
export function defineQuery<TArgs extends any[], TReturn>(
  handler: (context: RpcContext, ...args: TArgs) => TReturn | Promise<TReturn>,
  options?: { permission?: 'read' | 'write' },
): QueryDefinition<TArgs, TReturn> {
  return {
    type: 'query',
    permission: options?.permission ?? 'read',
    handler,
  };
}

/** Declares a side-effecting server handler. Defaults to 'write' permission. */
export function defineMutation<TArgs extends any[], TReturn = void>(
  handler: (context: RpcContext, ...args: TArgs) => TReturn | Promise<TReturn>,
  options?: { permission?: 'read' | 'write' },
): MutationDefinition<TArgs, TReturn> {
  return {
    type: 'mutation',
    permission: options?.permission ?? 'write',
    handler,
  };
}
