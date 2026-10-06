import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import events from '~/modules/game-events/game-events';
import { NetworkServer } from '~/modules/remote-mic/network/server/network-server';
import RemoteMicManager from '~/modules/remote-mic/remote-mic-manager';

const fake = vi.hoisted(() => {
  class FakeTransport {
    public readonly name = 'PartyKit';
    public onClose: (() => void) | undefined;
    public connect = vi.fn((_room: string, onConnect: () => void, onClose: () => void) => {
      this.onClose = onClose;
      onConnect();
    });
    public disconnect = vi.fn();
    public addListener = vi.fn();
    public clearAllListeners = vi.fn();
    public getCurrentPing = () => 0;
    public removePlayer = vi.fn();
  }

  return { FakeTransport, instances: [] as InstanceType<typeof FakeTransport>[] };
});

vi.mock('~/modules/remote-mic/network/server/transport/party-kit-server', () => ({
  PartyKitServerTransport: class extends fake.FakeTransport {
    public constructor() {
      super();
      fake.instances.push(this);
    }
  },
}));

const RECONNECT_DELAY_MS = 1_000;

describe('NetworkServer.stop', () => {
  let server: NetworkServer;
  const stopped = vi.fn();

  beforeEach(() => {
    vi.useFakeTimers();
    fake.instances.length = 0;
    server = new NetworkServer();
    events.micServerStopped.subscribe(stopped);
  });

  afterEach(() => {
    events.micServerStopped.unsubscribe(stopped);
    stopped.mockClear();
    vi.useRealTimers();
  });

  it('reports that there was nothing to close for a server that never started', () => {
    expect(server.stop()).toBe(false);
    expect(stopped).not.toHaveBeenCalled();
  });

  it('closes a running server and reports it as stopped', () => {
    server.start();
    expect(server.isStarted()).toBe(true);

    expect(server.stop()).toBe(true);

    expect(server.isStarted()).toBe(false);
    expect(fake.instances[0].disconnect).toHaveBeenCalledOnce();
    expect(stopped).toHaveBeenCalledOnce();
  });

  it('does not reconnect on its own after the close it caused', () => {
    server.start();
    server.stop();
    // What a real transport does once its socket is shut
    fake.instances[0].onClose?.();
    vi.advanceTimersByTime(RECONNECT_DELAY_MS * 2);

    expect(server.isStarted()).toBe(false);
    expect(fake.instances).toHaveLength(1);
    expect(stopped).toHaveBeenCalledOnce();
  });

  it('cancels a reconnect that a dropped connection had queued, and still counts as having been up', () => {
    server.start();
    fake.instances[0].onClose?.();
    expect(server.isStarted()).toBe(false);

    expect(server.stop()).toBe(true);
    vi.advanceTimersByTime(RECONNECT_DELAY_MS * 2);

    expect(server.isStarted()).toBe(false);
  });

  it('drops the phones that were connected', () => {
    const removeRemoteMic = vi.spyOn(RemoteMicManager, 'removeRemoteMic');
    vi.spyOn(RemoteMicManager, 'getRemoteMics').mockReturnValue([
      { id: 'phone-1' } as ReturnType<typeof RemoteMicManager.getRemoteMics>[number],
    ]);
    server.start();

    server.stop();

    expect(removeRemoteMic).toHaveBeenCalledWith('phone-1', true);
    vi.restoreAllMocks();
  });

  it('opens a fresh server when started again', () => {
    server.start();
    server.stop();

    server.start();

    expect(server.isStarted()).toBe(true);
    expect(fake.instances).toHaveLength(2);
  });
});
