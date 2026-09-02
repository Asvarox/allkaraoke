import { describe, expect, it } from 'vitest';

import { ONLINE_SLOT_COUNT, slotChannelName } from '~/modules/online/signaling/protocol';
import { ONLINE_MAX_PLAYERS } from '~/modules/players/player-number';

describe('signaling protocol', () => {
  it('publishes exactly one slot channel per possible singer', () => {
    // The host opens every slot channel up front so nobody joining forces a renegotiation. Fewer
    // slots than players would make a room reject a singer the room logic would have accepted; the
    // constant cannot import ONLINE_MAX_PLAYERS itself because the Worker build has no `~` alias.
    expect(ONLINE_SLOT_COUNT).toBe(ONLINE_MAX_PLAYERS);
  });

  it('names slot channels so the host can read the slot back off the channel', () => {
    expect(slotChannelName(3)).toBe('slot-3');
    expect(Number(slotChannelName(3).slice('slot-'.length))).toBe(3);
  });
});
