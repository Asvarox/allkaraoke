import { MAX_POINTS } from '~/consts';
import { SingSetup, SongPreview } from '~/interfaces';
import { collectBackfillCandidates } from '~/modules/leaderboard/backfill';
import { BACKFILL_WINDOW_MS, MAX_SUBMITTED_SCORE } from '~/modules/leaderboard/consts';
import { getSongKey, SongStats } from '~/modules/songs/stats/common';

const now = Date.UTC(2026, 9, 25);
const day = 24 * 60 * 60 * 1000;

const song = (id: string) =>
  ({ id, artist: `Artist ${id}`, title: `Title ${id}`, lastUpdate: '2026-01-01' }) as SongPreview;

const play = (scores: number[], daysAgo: number, tolerance = 2): SongStats['scores'][number] => ({
  setup: { id: 'setup', players: [], mode: 'DUEL', tolerance } as unknown as SingSetup,
  scores: scores.map((score, index) => ({ name: `P${index}`, score })),
  date: new Date(now - daysAgo * day).toISOString(),
});

const stats = (entries: Array<[SongPreview, SongStats['scores']]>) =>
  Object.fromEntries(entries.map(([forSong, scores]) => [getSongKey(forSong), { plays: scores.length, scores }]));

describe('collectBackfillCandidates', () => {
  const first = song('a');
  const second = song('b');

  it('picks the best refused run per song, across players and difficulties', () => {
    const candidates = collectBackfillCandidates(
      stats([
        [first, [play([MAX_POINTS + 10, 1_000_000], 2), play([MAX_POINTS + 500], 5, 1)]],
        [second, [play([MAX_POINTS + 20.4], 1)]],
      ]),
      [first, second],
      now,
    );

    expect(candidates).toEqual([
      expect.objectContaining({ songId: 'a', score: MAX_POINTS + 500, tolerance: 1, playedAt: now - 5 * day }),
      expect.objectContaining({ songId: 'b', score: MAX_POINTS + 20, tolerance: 2, mode: 'DUEL' }),
    ]);
  });

  it('skips runs the regular path took, runs over the cap, old runs and debug difficulties', () => {
    const candidates = collectBackfillCandidates(
      stats([
        [
          first,
          [
            play([MAX_POINTS], 1),
            play([MAX_SUBMITTED_SCORE + 1], 1),
            play([MAX_POINTS + 1], BACKFILL_WINDOW_MS / day + 1),
            play([MAX_POINTS + 1], 1, 4),
          ],
        ],
      ]),
      [first],
      now,
    );

    expect(candidates).toEqual([]);
  });

  it('skips songs no longer in the library', () => {
    expect(collectBackfillCandidates(stats([[first, [play([MAX_POINTS + 1], 1)]]]), [], now)).toEqual([]);
  });
});
