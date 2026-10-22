import { describe, expect, it } from 'vitest';

import { P2P_ROOM_CODE_PATTERN } from '~/modules/online/signaling/protocol';
import { REMOTE_MIC_ROOM_CODE_PATTERN } from '~/modules/remote-mic/network/realtime-protocol';
import { GAME_CODE_LENGTH } from '~/modules/remote-mic/network/server/network-server';

describe('remote-mic Realtime protocol', () => {
  it('accepts exactly the code a Realtime game hands out', () => {
    expect('k'.repeat(GAME_CODE_LENGTH)).toMatch(REMOTE_MIC_ROOM_CODE_PATTERN);
  });

  it('never accepts an online room code', () => {
    expect('2abcd').toMatch(P2P_ROOM_CODE_PATTERN);
    expect('2abcd').not.toMatch(REMOTE_MIC_ROOM_CODE_PATTERN);
  });
});
