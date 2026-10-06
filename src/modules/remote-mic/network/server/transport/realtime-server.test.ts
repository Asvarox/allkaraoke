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
    fake.slotHolders.clear();
    fake.sent.length = 0;
    transport = new RealtimeServerTransport();
    transport.addListener((message, sender) => received(message, sender.peer));
    await new Promise<void>((resolve) => transport.connect('rabcd', resolve, () => {}));
  });

  afterEach(() => {
    transport.disconnect();
    received.mockReset();
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
});
