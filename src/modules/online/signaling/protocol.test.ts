import { describe, expect, it } from 'vitest';

import { ONLINE_ROOM_CODE_LENGTH } from '~/modules/online/protocol/consts';
import {
  ONLINE_SLOT_COUNT,
  P2P_ROOM_CODE_LEADS,
  P2P_ROOM_CODE_PATTERN,
  slotChannelName,
} from '~/modules/online/signaling/protocol';
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

  it('holds P2P codes to the same length as every room code, and to exactly the marks the app uses', () => {
    // The pattern is spelt out by hand for the Worker build, which cannot import the app's
    // constants — this is what keeps the two from drifting apart.
    const letters = 'k'.repeat(ONLINE_ROOM_CODE_LENGTH - 1);
    for (const lead of P2P_ROOM_CODE_LEADS) expect(`${lead}${letters}`).toMatch(P2P_ROOM_CODE_PATTERN);
    for (const lead of '01abz') expect(`${lead}${letters}`).not.toMatch(P2P_ROOM_CODE_PATTERN);
    expect(`2${letters}k`).not.toMatch(P2P_ROOM_CODE_PATTERN);
  });
});
