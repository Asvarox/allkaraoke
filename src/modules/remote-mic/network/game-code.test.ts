import { describe, expect, it } from 'vitest';

import { generateOnlineRoomCode } from '~/modules/online/client/room-code';
import { isRemoteMicGameCode } from '~/modules/remote-mic/network/game-code';
import { REMOTE_MIC_ROOM_CODE_LEAD } from '~/modules/remote-mic/network/realtime-protocol';
import { GAME_CODE_LENGTH } from '~/modules/remote-mic/network/server/network-server';

describe('isRemoteMicGameCode', () => {
  it('recognises the codes a game hands out', () => {
    const letters = 'a'.repeat(GAME_CODE_LENGTH - 1);

    expect(isRemoteMicGameCode(`${REMOTE_MIC_ROOM_CODE_LEAD}${letters}`)).toBe(true);
  });

  it('accepts codes as typed — uppercase and with stray whitespace', () => {
    expect(isRemoteMicGameCode(' RABCD ')).toBe(true);
  });

  it('never accepts an online room code', () => {
    for (let attempt = 0; attempt < 200; attempt++) {
      expect(isRemoteMicGameCode(generateOnlineRoomCode())).toBe(false);
    }
  });

  it('rejects incomplete or malformed codes', () => {
    expect(isRemoteMicGameCode('rabc')).toBe(false);
    expect(isRemoteMicGameCode('rabcde')).toBe(false);
    expect(isRemoteMicGameCode('xabcd')).toBe(false);
  });
});
