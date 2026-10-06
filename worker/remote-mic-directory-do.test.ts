import { reset } from 'cloudflare:test';
import { env as workerEnv } from 'cloudflare:workers';
import { afterEach, describe, expect, it } from 'vitest';

import type { JoinRoomResponse } from '../src/modules/network/realtime/protocol';
import { REMOTE_MIC_SLOT_COUNT } from '../src/modules/remote-mic/network/realtime-protocol';
import type { RemoteMicDirectory } from './remote-mic-directory-do';

// The room logic itself is shared with online mode and covered by online-directory-do.test.ts; this
// covers only where a remote-mic room differs.

let roomCounter = 0;
const getDirectory = () => {
  const namespace = workerEnv.REMOTE_MIC_DIRECTORY as DurableObjectNamespace<RemoteMicDirectory>;
  return namespace.get(namespace.idFromName(`room${(roomCounter += 1)}`));
};

const secretOf = (response: JoinRoomResponse) => (response.ok ? response.secret : undefined);

afterEach(async () => {
  await reset();
});

describe('RemoteMicDirectory', () => {
  it('holds a slot for every phone the game can take', async () => {
    const directory = getDirectory();
    await directory.join('game', 's0', true);
    for (let i = 1; i < REMOTE_MIC_SLOT_COUNT; i++) {
      expect(await directory.join(`phone${i}`, `s${i}`, false)).toMatchObject({ ok: true, slot: i });
    }

    expect(await directory.join('one-too-many', 'sx', false)).toEqual({ ok: false, reason: 'room-full' });
  });

  it('never hands the host role to a phone', async () => {
    const directory = getDirectory();
    const game = await directory.join('game', 's1', true);
    const phone = await directory.join('phone', 's2', false);

    // The game is the room: a phone hosting it would leave every other phone talking to nobody
    expect(await directory.promote('phone', 's2', (game as { epoch: number }).epoch, secretOf(phone))).toMatchObject({
      ok: false,
      reason: 'not-authorized',
    });
    await directory.leave('game', { requestedBy: { participantId: 'game', sessionId: 's1' } });
    expect(await directory.info()).toMatchObject({ hostSessionId: 's1' });
  });

  it('lets a reloaded game take its room back on a new session', async () => {
    const directory = getDirectory();
    const game = await directory.join('game', 's1', true);
    await directory.join('phone', 's2', false);

    expect(await directory.join('game', 's1-new', true, secretOf(game))).toMatchObject({
      ok: true,
      isHost: true,
      hostSessionId: 's1-new',
    });
  });
});
