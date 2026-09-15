import { SongStats } from '~/modules/songs/stats/common';
import { countPlaysToday } from '~/routes/game/singing/post-game/songs-played-today';

const hoursAgo = (hours: number) => new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();

const songWithPlaysAt = (...dates: string[]): SongStats => ({
  plays: dates.length,
  scores: dates.map((date) => ({ setup: {} as SongStats['scores'][number]['setup'], scores: [], date })),
});

describe('countPlaysToday', () => {
  it('counts nothing when nothing was played', () => {
    expect(countPlaysToday({})).toEqual(0);
  });

  it('counts every play from the last 24 hours across songs', () => {
    expect(
      countPlaysToday({
        a: songWithPlaysAt(hoursAgo(1), hoursAgo(3)),
        b: songWithPlaysAt(hoursAgo(5)),
      }),
    ).toEqual(3);
  });

  it('counts a repeated song once per play, since each is its own round', () => {
    expect(countPlaysToday({ a: songWithPlaysAt(hoursAgo(1), hoursAgo(2), hoursAgo(3)) })).toEqual(3);
  });

  it('ignores plays older than the last 24 hours', () => {
    expect(countPlaysToday({ a: songWithPlaysAt(hoursAgo(25), hoursAgo(48), hoursAgo(2)) })).toEqual(1);
  });

  it('survives records that predate the scores array', () => {
    expect(countPlaysToday({ a: { plays: 3 } as SongStats, b: songWithPlaysAt(hoursAgo(1)) })).toEqual(1);
  });
});
