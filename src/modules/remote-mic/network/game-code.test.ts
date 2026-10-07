import { describe, expect, it } from 'vitest';

import { generateOnlineRoomCode } from '~/modules/online/client/room-code';
import { isRemoteMicGameCode } from '~/modules/remote-mic/network/game-code';
import { GAME_CODE_LENGTH, GAME_CODE_TRANSPORT_PREFIX } from '~/modules/remote-mic/network/server/network-server';

describe('isRemoteMicGameCode', () => {
  it('recognises the codes of every transport a game hands out', () => {
    const letters = 'a'.repeat(GAME_CODE_LENGTH - 1);

    expect(isRemoteMicGameCode(`${GAME_CODE_TRANSPORT_PREFIX.PartyKit}${letters}`)).toBe(true);
    expect(isRemoteMicGameCode(`${GAME_CODE_TRANSPORT_PREFIX.Realtime}${letters}`)).toBe(true);
    expect(isRemoteMicGameCode(`${GAME_CODE_TRANSPORT_PREFIX.WebSockets}${letters}`)).toBe(true);
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
