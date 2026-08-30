import { reset } from 'cloudflare:test';
import { env as workerEnv } from 'cloudflare:workers';
import { afterEach, describe, expect, it } from 'vitest';

import { ONLINE_SLOT_COUNT } from '../src/modules/online/signaling/protocol';
import type { OnlineDirectory } from './online-directory-do';

let roomCounter = 0;
/** A fresh room per test — Durable Object state is keyed by name and `reset()` only clears storage
 * between tests, not within one. */
const getDirectory = () => {
  const namespace = workerEnv.ONLINE_DIRECTORY as DurableObjectNamespace<OnlineDirectory>;
  return namespace.get(namespace.idFromName(`room${(roomCounter += 1)}`));
};

afterEach(async () => {
  await reset();
});

describe('OnlineDirectory', () => {
  it('reports the data plane it was asked about, defaulting to the SFU', async () => {
    const directory = getDirectory();
    await directory.join('p1', 's1', true);

    // Production must never be told 'relay' — the signaling layer only passes it when Realtime is
    // unconfigured, and the default here is the safe one either way.
    expect(await directory.info()).toMatchObject({ dataPlane: 'sfu' });
    expect(await directory.info('relay')).toMatchObject({ dataPlane: 'relay' });
  });

  it('refuses a room nobody opened', async () => {
    const directory = getDirectory();

    expect(await directory.join('p1', 's1', false)).toEqual({ ok: false, reason: 'not-found' });
  });

  it('makes the participant that opens a room its host', async () => {
    const directory = getDirectory();

    const result = await directory.join('p1', 's1', true);

    expect(result).toMatchObject({ ok: true, isHost: true, hostSessionId: 's1', slot: 0 });
  });

  it('hands every joiner a distinct slot and keeps the first host', async () => {
    const directory = getDirectory();
    await directory.join('p1', 's1', true);

    const second = await directory.join('p2', 's2', false);
    const third = await directory.join('p3', 's3', false);

    expect(second).toMatchObject({ ok: true, isHost: false, hostSessionId: 's1', slot: 1 });
    expect(third).toMatchObject({ ok: true, isHost: false, hostSessionId: 's1', slot: 2 });
  });

  it('turns away a full room', async () => {
    const directory = getDirectory();
    await directory.join('p0', 's0', true);
    for (let i = 1; i < ONLINE_SLOT_COUNT; i++) {
      await directory.join(`p${i}`, `s${i}`, false);
    }

    expect(await directory.join('one-too-many', 'sx', false)).toEqual({ ok: false, reason: 'room-full' });
  });

  it('gives a rejoining participant back the slot it already owned', async () => {
    const directory = getDirectory();
    await directory.join('p1', 's1', true);
    const before = await directory.join('p2', 's2', false);

    // Same participant, new SFU session — what a reconnect after a network flap looks like.
    const after = await directory.join('p2', 's2-new', false);

    expect(after).toMatchObject({ ok: true, slot: (before as { slot: number }).slot });
  });

  it('frees a slot on leave so a full room can let somebody else in', async () => {
    const directory = getDirectory();
    await directory.join('p0', 's0', true);
    for (let i = 1; i < ONLINE_SLOT_COUNT; i++) {
      await directory.join(`p${i}`, `s${i}`, false);
    }

    await directory.leave('p3', { requestedBy: { participantId: 'p0', sessionId: 's0' } });

    expect(await directory.join('newcomer', 'sx', false)).toMatchObject({ ok: true, slot: 3 });
  });

  it('authorises a member only for its own session and slot', async () => {
    const directory = getDirectory();
    await directory.join('p1', 's1', true);
    await directory.join('p2', 's2', false);

    expect(await directory.authorize('p2', 's2')).toMatchObject({ ok: true, isHost: false, slot: 1 });
    // Knowing somebody's participant id must not be enough to act as them — the session has to
    // match the one they actually joined with.
    expect(await directory.authorize('p2', 'some-other-session')).toEqual({ ok: false });
    expect(await directory.authorize('never-joined', 'sx')).toEqual({ ok: false });
  });

  it('refuses a banned participant a slot even though the room logic lives elsewhere', async () => {
    const directory = getDirectory();
    await directory.join('p1', 's1', true);
    await directory.join('kicked', 's2', false);

    await directory.leave('kicked', { ban: true, requestedBy: { participantId: 'p1', sessionId: 's1' } });

    // Without this they could re-claim a seat and keep reading the room's broadcast channel, since
    // the room logic's own ban list only lives in the host's tab.
    expect(await directory.join('kicked', 's2-new', false)).toEqual({ ok: false, reason: 'banned' });
  });

  it('lets a participant release its own slot', async () => {
    const directory = getDirectory();
    await directory.join('p1', 's1', true);
    await directory.join('p2', 's2', false);

    await directory.leave('p2', { requestedBy: { participantId: 'p2', sessionId: 's2' } });

    expect(await directory.join('newcomer', 'sx', false)).toMatchObject({ ok: true, slot: 1 });
  });

  it('refuses to remove somebody on behalf of a participant that is not the host', async () => {
    const directory = getDirectory();
    await directory.join('p1', 's1', true);
    await directory.join('p2', 's2', false);
    await directory.join('p3', 's3', false);

    // A room code plus a participant id must not be enough to throw a singer out.
    await directory.leave('p3', { requestedBy: { participantId: 'p2', sessionId: 's2' } });

    expect(await directory.authorize('p3', 's3')).toMatchObject({ ok: true });
  });

  it('refuses a ban from anyone but the host', async () => {
    const directory = getDirectory();
    await directory.join('p1', 's1', true);
    await directory.join('p2', 's2', false);
    await directory.join('p3', 's3', false);

    await directory.leave('p3', { ban: true, requestedBy: { participantId: 'p2', sessionId: 's2' } });

    expect(await directory.join('p3', 's3', false)).toMatchObject({ ok: true });
  });

  it('ignores a removal from a session that does not match its participant', async () => {
    const directory = getDirectory();
    await directory.join('p1', 's1', true);
    await directory.join('p2', 's2', false);

    await directory.leave('p2', { requestedBy: { participantId: 'p1', sessionId: 'forged-session' } });

    expect(await directory.authorize('p2', 's2')).toMatchObject({ ok: true });
  });

  it('promotes the claimant and bumps the epoch', async () => {
    const directory = getDirectory();
    const host = await directory.join('p1', 's1', true);
    await directory.join('p2', 's2', false);

    const result = await directory.promote('p2', 's2', (host as { epoch: number }).epoch);

    expect(result).toEqual({ ok: true, epoch: (host as { epoch: number }).epoch + 1 });
    expect(await directory.info()).toMatchObject({ hostSessionId: 's2' });
  });

  it('lets only the first of two simultaneous claims win', async () => {
    const directory = getDirectory();
    const host = await directory.join('p1', 's1', true);
    await directory.join('p2', 's2', false);
    await directory.join('p3', 's3', false);
    const epoch = (host as { epoch: number }).epoch;

    const winner = await directory.promote('p2', 's2', epoch);
    // p3 saw the same stall and claims with the epoch it knew, which is now stale.
    const loser = await directory.promote('p3', 's3', epoch);

    expect(winner).toMatchObject({ ok: true });
    // The rejection is how the loser finds out who won — it must carry the winner's session.
    expect(loser).toMatchObject({ ok: false, reason: 'stale-epoch', hostSessionId: 's2' });
  });

  it('refuses a promotion from somebody who is not in the room', async () => {
    const directory = getDirectory();
    const host = await directory.join('p1', 's1', true);

    const result = await directory.promote('stranger', 'sx', (host as { epoch: number }).epoch);

    expect(result).toMatchObject({ ok: false, reason: 'not-a-member' });
  });

  it('keeps the outgoing host as a participant — it may only have been throttled', async () => {
    const directory = getDirectory();
    const host = await directory.join('p1', 's1', true);
    const second = await directory.join('p2', 's2', false);
    await directory.promote('p2', 's2', (host as { epoch: number }).epoch);

    // p1 comes back: it must still hold its original slot rather than be treated as a newcomer.
    const rejoin = await directory.join('p1', 's1', false);

    expect(rejoin).toMatchObject({ ok: true, isHost: false, slot: 0, hostSessionId: 's2' });
    expect((second as { slot: number }).slot).toBe(1);
  });

  it('elects a replacement host when the current one leaves outright', async () => {
    const directory = getDirectory();
    await directory.join('p1', 's1', true);
    await directory.join('p2', 's2', false);

    await directory.leave('p1', { requestedBy: { participantId: 'p1', sessionId: 's1' } });

    expect(await directory.info()).toMatchObject({ hostSessionId: 's2' });
  });
});
