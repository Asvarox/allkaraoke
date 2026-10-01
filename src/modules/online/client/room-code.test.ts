import { describe, expect, it } from 'vitest';

import { generateOnlineRoomCode } from '~/modules/online/client/room-code';
import { ONLINE_ROOM_CODE_LENGTH } from '~/modules/online/protocol/consts';
import { P2P_ROOM_CODE_PATTERN } from '~/modules/online/signaling/protocol';

describe('generateOnlineRoomCode', () => {
  it('opens a room under a code the Worker will accept', () => {
    for (let attempt = 0; attempt < 200; attempt++) {
      const code = generateOnlineRoomCode();
      expect(code).toHaveLength(ONLINE_ROOM_CODE_LENGTH);
      expect(code).toMatch(P2P_ROOM_CODE_PATTERN);
    }
  });
});
