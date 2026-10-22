import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { RealtimeFrame } from '~/modules/remote-mic/network/realtime';
import { RealtimeServerTransport } from '~/modules/remote-mic/network/server/transport/realtime-server';

const fake = vi.hoisted(() => ({
  slotHolders: new Map<number, string>(),
  sent: [] as Array<{ slot: number; frame: unknown }>,
  deliver: null as ((frame: unknown, slot: number | null) => void) | null,
}));

vi.mock('~/modules/network/realtime/sfu-room-connection', () => ({
  SfuRoomConnection: class {
    public join = async () => ({
      ok: true,
      membership: { isHost: true, hostSessionId: 'game-session', epoch: 1, slot: 0 },
    });
    public onMessage = (listener: (frame: unknown, slot: number | null) => void) => {
      fake.deliver = listener;
      return () => {};
    };
    public onLost = () => () => {};
    public broadcast = () => {};
    public keepalive = async () => {};
    public getRoundTripTime = async () => null;
    public getSlotHolder = async (slot: number) => fake.slotHolders.get(slot) ?? null;
    public sendToSlot = (slot: number, frame: unknown) => fake.sent.push({ slot, frame });
    public releaseSlot = async () => {};
    public close = () => {};
  },
}));

const frame = (value: RealtimeFrame, slot: number) => fake.deliver!(value, slot);

describe('RealtimeServerTransport', () => {
  let transport: RealtimeServerTransport;
  const received = vi.fn();

  beforeEach(async () => {
    vi.useFakeTimers({ toFake: ['setInterval', 'clearInterval', 'Date'] });
    fake.slotHolders.clear();
    fake.sent.length = 0;
    transport = new RealtimeServerTransport();
    transport.addListener((message, sender) => received(message, sender.peer));
    await new Promise<void>((resolve) => transport.connect('rabcd', resolve, () => {}));
  });

  afterEach(() => {
    transport.disconnect();
    received.mockReset();
    vi.useRealTimers();
  });

  it('attributes a slot to the phone the directory placed on it, including what it said meanwhile', async () => {
    fake.slotHolders.set(1, 'phone-a');

    frame({ t: 'rt-hello', id: 'phone-a' }, 1);
    frame({ t: 'ping' }, 1);
    await vi.waitFor(() => expect(received).toHaveBeenCalledWith({ t: 'ping' }, 'phone-a'));
  });

  it('refuses a phone claiming somebody else’s id', async () => {
    fake.slotHolders.set(1, 'phone-a');
    fake.slotHolders.set(2, 'attacker');

    frame({ t: 'rt-hello', id: 'phone-a' }, 2);
    frame({ t: 'rpc-unsub', channel: 'remote-mics' }, 2);
    await vi.waitFor(() =>
      expect(fake.sent).toContainEqual({ slot: 2, frame: { t: 'rt-close', reason: 'not-authorized' } }),
    );

    frame({ t: 'ping' }, 2);
    expect(received).not.toHaveBeenCalled();
  });

  it('reports a phone that went silent as unregistered and tells it to reconnect', async () => {
    fake.slotHolders.set(1, 'phone-a');
    frame({ t: 'rt-hello', id: 'phone-a' }, 1);
    frame({ t: 'ping' }, 1);
    await vi.waitFor(() => expect(received).toHaveBeenCalledWith({ t: 'ping' }, 'phone-a'));

    vi.advanceTimersByTime(3_000);
    expect(received).not.toHaveBeenCalledWith({ t: 'unregister' }, 'phone-a');

    vi.advanceTimersByTime(2_000);
    expect(received).toHaveBeenCalledWith({ t: 'unregister' }, 'phone-a');
    expect(fake.sent).toContainEqual({ slot: 1, frame: { t: 'rt-close', reason: 'connection-lost' } });

    // Dropped: what it says from now on is not attributed to it until it says hello again
    frame({ t: 'ping' }, 1);
    expect(received).toHaveBeenCalledTimes(2);
  });

  it('keeps a phone that keeps talking', async () => {
    fake.slotHolders.set(1, 'phone-a');
    frame({ t: 'rt-hello', id: 'phone-a' }, 1);
    frame({ t: 'pong' }, 1);
    await vi.waitFor(() => expect(received).toHaveBeenCalledWith({ t: 'pong' }, 'phone-a'));

    for (let second = 0; second < 10; second++) {
      vi.advanceTimersByTime(1_000);
      frame({ t: 'pong' }, 1);
    }

    expect(received).not.toHaveBeenCalledWith({ t: 'unregister' }, 'phone-a');
  });

  it('tells a phone talking on a slot nobody is bound to to reconnect', () => {
    frame({ t: 'ping' }, 3);
    frame({ t: 'ping' }, 3);

    expect(fake.sent).toEqual([{ slot: 3, frame: { t: 'rt-close', reason: 'connection-lost' } }]);
    expect(received).not.toHaveBeenCalled();
  });
});
