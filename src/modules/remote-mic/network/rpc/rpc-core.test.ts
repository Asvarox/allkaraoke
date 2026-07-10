import { describe, expect, expectTypeOf, it, vi } from 'vitest';
import { OnlineServerRpc } from '~/modules/online/protocol/room-logic';
import { OnlineRoomState } from '~/modules/online/protocol/types';
import { defineMutation, defineQuery } from './define';
import { RpcServer } from './rpc-server';
import { ClientSubscriptionManager } from './subscription-manager';
import { ExtractContract, RpcRequest } from './types';

describe('RpcServer (feature-agnostic core)', () => {
  const handlers = {
    math: {
      add: defineQuery((_ctx, a: number, b: number) => a + b),
      reset: defineMutation((_ctx) => undefined),
    },
  };

  const createServer = (permission: 'read' | 'write' = 'write') => {
    const sent: any[] = [];
    const server = new RpcServer(
      handlers,
      () => permission,
      () => undefined,
      () => undefined,
    );
    const sender = { peer: 'peer-1', send: (payload: any) => sent.push(payload) };
    return { server, sender, sent };
  };

  const request = (ns: string, method: string, args: any[]): RpcRequest => ({ t: 'rpc', ns, method, args, id: 'id1' });

  it('dispatches requests and returns results', async () => {
    const { server, sender, sent } = createServer();
    await server.handleMessage(request('math', 'add', [2, 3]), sender);
    expect(sent).toEqual([{ t: 'rpc-res', id: 'id1', result: 5 }]);
  });

  it('rejects write mutations from read-only callers', async () => {
    const { server, sender, sent } = createServer('read');
    await server.handleMessage(request('math', 'reset', []), sender);
    expect(sent).toEqual([{ t: 'rpc-res', id: 'id1', error: 'Permission denied' }]);
  });

  it('errors on unknown namespaces and methods', async () => {
    const { server, sender, sent } = createServer();
    await server.handleMessage(request('nope', 'add', []), sender);
    await server.handleMessage(request('math', 'nope', []), sender);
    expect(sent.map((message) => message.error)).toEqual(['Unknown namespace: nope', 'Unknown method: math.nope']);
  });

  it('derives the client contract from the handler map', () => {
    type Contract = ExtractContract<typeof handlers>;
    expectTypeOf<Contract['math']['add']>().toEqualTypeOf<(a: number, b: number) => Promise<number>>();
    // The online feature's contract resolves through the same generic machinery
    expectTypeOf<OnlineServerRpc['room']['getState']>().toEqualTypeOf<() => Promise<OnlineRoomState>>();
    expectTypeOf<OnlineServerRpc['selection']['getChart']>().toEqualTypeOf<() => Promise<string>>();
  });
});

describe('ClientSubscriptionManager (generic channels)', () => {
  type Channels = { counter: number; message: string };

  it('supports feature-specific channel maps with ref-counting and cached replay', () => {
    const manager = new ClientSubscriptionManager<Channels>();
    const sendSubscribe = vi.fn();
    const sendUnsubscribe = vi.fn();
    manager.setSendFunctions(sendSubscribe, sendUnsubscribe);

    const received: number[] = [];
    const unsubscribe = manager.subscribe('counter', (data) => received.push(data));
    expect(sendSubscribe).toHaveBeenCalledWith('counter');

    manager.handlePublish('counter', 42);
    expect(received).toEqual([42]);

    // A second subscriber gets the cached value immediately and does not re-subscribe
    const laterValues: number[] = [];
    manager.subscribe('counter', (data) => laterValues.push(data));
    expect(laterValues).toEqual([42]);
    expect(sendSubscribe).toHaveBeenCalledTimes(1);

    unsubscribe();
    expect(sendUnsubscribe).not.toHaveBeenCalled();
  });

  it('re-subscribes active channels after reconnect', () => {
    const manager = new ClientSubscriptionManager<Channels>();
    manager.subscribe('message', () => undefined);

    const sendSubscribe = vi.fn();
    manager.setSendFunctions(sendSubscribe, vi.fn());
    expect(sendSubscribe).toHaveBeenCalledWith('message');
  });
});
