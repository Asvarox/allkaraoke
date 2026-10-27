import { readFileSync } from 'fs';

import { GAME_MODE, SingSetup } from '~/interfaces';
import { fixMergedTrackScores, SCORING_VERSION } from '~/modules/songs/stats/merged-track-score-fix';
import convertTxtToSong from '~/modules/songs/utils/convert-txt-to-song';
import { getMergedTrackFactor } from '~/modules/songs/utils/merged-track-factor';

const duet = convertTxtToSong(readFileSync('public/songs/linkin-park-heavy-is-the-crown.txt', 'utf-8'));

const setup = (tracks: number[], mode: SingSetup['mode'] = GAME_MODE.DUEL): SingSetup => ({
  id: 'sing-1',
  players: tracks.map((track, number) => ({ number: number as 0, track })),
  mode,
  tolerance: 2,
});

const record = (tracks: number[], scores: number[], mode?: SingSetup['mode']) => ({
  setup: setup(tracks, mode),
  scores: scores.map((score, index) => ({ name: `Player ${index}`, score })),
  date: '2026-10-01T10:00:00.000Z',
});

describe('fixMergedTrackScores', () => {
  it('rescales a solo run to the merged track and reports it', () => {
    const result = fixMergedTrackScores({ plays: 1, scores: [record([0], [7_000_000])] }, duet)!;

    const newScore = 7_000_000 * getMergedTrackFactor(duet, 0);
    expect(result.stats.scores[0]).toMatchObject({
      scoringVersion: SCORING_VERSION,
      scores: [{ name: 'Player 0', score: newScore }],
    });
    expect(result.adjustments).toEqual([
      expect.objectContaining({ songId: duet.id, name: 'Player 0', oldScore: 7_000_000, newScore }),
    ]);
  });

  it('rescales each player of a three-player duel by their own track', () => {
    const result = fixMergedTrackScores({ plays: 1, scores: [record([0, 1, 0], [3e6, 2e6, 1e6])] }, duet)!;

    expect(result.stats.scores[0].scores.map(({ score }) => score)).toEqual([
      3e6 * getMergedTrackFactor(duet, 0),
      2e6 * getMergedTrackFactor(duet, 1),
      1e6 * getMergedTrackFactor(duet, 0),
    ]);
  });

  it('rescales the averaged co-op score by the average factor', () => {
    const result = fixMergedTrackScores({ plays: 1, scores: [record([0, 1, 1], [3e6], GAME_MODE.CO_OP)] }, duet)!;

    const factor = (getMergedTrackFactor(duet, 0) + 2 * getMergedTrackFactor(duet, 1)) / 3;
    expect(result.stats.scores[0].scores[0].score).toBeCloseTo(3e6 * factor, 5);
  });

  it('only stamps a two-player run, which was scored against its own tracks', () => {
    const result = fixMergedTrackScores({ plays: 1, scores: [record([0, 1], [3e6, 2e6])] }, duet)!;

    expect(result.stats.scores[0]).toMatchObject({
      scoringVersion: SCORING_VERSION,
      scores: [{ score: 3e6 }, { score: 2e6 }],
    });
    expect(result.adjustments).toEqual([]);
  });

  it('leaves already stamped runs alone, so running twice changes nothing', () => {
    const first = fixMergedTrackScores({ plays: 1, scores: [record([0], [7_000_000])] }, duet)!;

    expect(fixMergedTrackScores(first.stats, duet)).toBeNull();
  });
});
