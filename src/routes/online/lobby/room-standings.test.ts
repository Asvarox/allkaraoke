import { describe, expect, it } from 'vitest';

import { OnlineParticipant, RoomScores } from '~/modules/online/protocol/types';
import { PlayerNumber } from '~/modules/players/player-number';
import { rankParticipants } from '~/routes/online/lobby/room-standings';

const participant = (id: string, joinOrder: number): OnlineParticipant => ({
  id,
  name: `Name ${id}`,
  joinOrder,
  playerNumber: joinOrder as PlayerNumber,
  connected: true,
  ready: false,
  graceDeadline: null,
});

const p1 = participant('p1', 0);
const p2 = participant('p2', 1);
const p3 = participant('p3', 2);

const order = (rows: ReturnType<typeof rankParticipants>) => rows.map((row) => row.participant.id);

describe('rankParticipants', () => {
  const scores: RoomScores = {
    p1: { total: 300, lastSong: 10 },
    p2: { total: 100, lastSong: 90 },
  };

  it('ranks by the tab that is showing', () => {
    expect(order(rankParticipants([p1, p2], scores, 'session'))).toEqual(['p1', 'p2']);
    expect(order(rankParticipants([p1, p2], scores, 'last-song'))).toEqual(['p2', 'p1']);
  });

  it('puts a singer with no score on this tab last, with a dash rather than a zero', () => {
    const rows = rankParticipants([p3, p1, p2], scores, 'session');
    expect(order(rows)).toEqual(['p1', 'p2', 'p3']);
    expect(rows.at(-1)?.score).toBeNull();
  });

  it('sorts a singer who sat the last song out below one who scored nothing in it', () => {
    const satOut: RoomScores = { p1: { total: 300, lastSong: null }, p2: { total: 100, lastSong: 0 } };
    expect(order(rankParticipants([p1, p2], satOut, 'last-song'))).toEqual(['p2', 'p1']);
  });

  it('breaks ties by join order, so a board of equal scores stops reshuffling itself', () => {
    const tied: RoomScores = { p1: { total: 50, lastSong: 50 }, p2: { total: 50, lastSong: 50 } };
    expect(order(rankParticipants([p2, p1], tied, 'session'))).toEqual(['p1', 'p2']);
  });

  it('lists only the singers still in the room — a departed one is gone with their score', () => {
    // The room drops both together (see `removeParticipant`), but a stale score arriving with a
    // participant list that has already lost them must not resurrect the row either.
    expect(order(rankParticipants([p1], scores, 'session'))).toEqual(['p1']);
  });
});
