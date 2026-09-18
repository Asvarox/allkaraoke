import { describe, expect, it } from 'vitest';

import { generateOnlineRoomCode, roomModeOf } from '~/modules/online/client/room-mode';
import { ONLINE_ROOM_CODE_LENGTH } from '~/modules/online/protocol/consts';
import { P2P_ROOM_CODE_PATTERN } from '~/modules/online/signaling/protocol';

describe('roomModeOf', () => {
  it('reads a leading digit as P2P', () => {
    expect(roomModeOf('7kqrx')).toBe('p2p');
    expect(roomModeOf('2abcd')).toBe('p2p');
  });

  it('keeps every all-letter code a PartyKit room, as every code handed out so far has been', () => {
    // The point of marking P2P with a digit: a room opened before this existed still resolves to
    // the backend it actually lives in.
    expect(roomModeOf('abcde')).toBe('server');
    expect(roomModeOf('zzzzz')).toBe('server');
  });

  it('leaves 0 and 1 out of the P2P marks — they read as O and l', () => {
    expect(roomModeOf('0abcd')).toBe('server');
    expect(roomModeOf('1abcd')).toBe('server');
  });
});

describe('generateOnlineRoomCode', () => {
  it('opens a P2P room under a code that reads back as P2P, and the Worker will accept', () => {
    for (let attempt = 0; attempt < 200; attempt++) {
      const code = generateOnlineRoomCode('p2p');
      expect(code).toHaveLength(ONLINE_ROOM_CODE_LENGTH);
      expect(code).toMatch(P2P_ROOM_CODE_PATTERN);
      expect(roomModeOf(code)).toBe('p2p');
    }
  });

  it('opens a server room under the same all-letter code as always', () => {
    for (let attempt = 0; attempt < 200; attempt++) {
      const code = generateOnlineRoomCode('server');
      expect(code).toMatch(/^[a-z]+$/);
      expect(code).toHaveLength(ONLINE_ROOM_CODE_LENGTH);
      expect(roomModeOf(code)).toBe('server');
    }
  });
});
