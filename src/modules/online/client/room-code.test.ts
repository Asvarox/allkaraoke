import { describe, expect, it } from 'vitest';

import { generateOnlineRoomCode, isOnlineRoomCode } from '~/modules/online/client/room-code';
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

describe('isOnlineRoomCode', () => {
  it('recognises every generated room code', () => {
    for (let attempt = 0; attempt < 200; attempt++) {
      expect(isOnlineRoomCode(generateOnlineRoomCode())).toBe(true);
    }
  });

  it('accepts codes as typed on a phone — uppercase and with stray whitespace', () => {
    expect(isOnlineRoomCode('2ABCD')).toBe(true);
    expect(isOnlineRoomCode(' 9wxyz ')).toBe(true);
  });

  it('rejects remote-mic game codes, which lead with a transport letter', () => {
    expect(isOnlineRoomCode('kabcd')).toBe(false);
    expect(isOnlineRoomCode('rabcd')).toBe(false);
    expect(isOnlineRoomCode('WABCD')).toBe(false);
  });

  it('rejects incomplete or malformed codes', () => {
    expect(isOnlineRoomCode('')).toBe(false);
    expect(isOnlineRoomCode('2abc')).toBe(false);
    expect(isOnlineRoomCode('2abcde')).toBe(false);
    expect(isOnlineRoomCode('1abcd')).toBe(false);
    expect(isOnlineRoomCode('0abcd')).toBe(false);
    expect(isOnlineRoomCode('23abc')).toBe(false);
  });
});
