import { useMemo } from 'react';
import { HighScoreEntity, SingSetup, Song } from '~/interfaces';
import { useSongStats } from '~/modules/Songs/stats/hooks';
import isE2E from '~/modules/utils/isE2E';
import seededRandom from '~/modules/utils/seededRandom';

const fakePlayerNames = [
  'Lysa Arryn',
  'Peter Parker',
  'Zordon',
  'Chad Khalimov',
  'Dat Boi',
  'Good Guy Greg',
  'Steve',
  'Meme Man',
  'Pepe',
  'Wojak',
  'Ebmarah',
  'Shrek',
  'Vad of ICE Beat',
  'Krasnolud',
  'Mały Aragorn',
  'Morning Breeze',
  'Auytjak Lorav',
  'Smelly Cat',
  'Stinky Foot',
];
const fakeDateFrom = new Date('2016-01-01').getTime();
const fakeDateTo = new Date('2024-01-07').getTime();

const MAX_SCORES = 5;

export default function useHighScores(song: Song, singSetup: SingSetup): HighScoreEntity[] {
  const stats = useSongStats(song);

  const highScores = useMemo(() => {
    const fakeNamesPool = [...fakePlayerNames];
    const fakeScores: HighScoreEntity[] = Array.from({ length: MAX_SCORES }, (_, i) => {
      const random = seededRandom(song.id + i);
      const score = 600_000 + (1_400_000 / (MAX_SCORES - 1)) * i;
      const name = fakeNamesPool.splice(Math.floor(random * fakeNamesPool.length), 1)[0];
      return {
        singSetupId: i.toString(),
        name: name,
        score: isE2E() ? score / 1000 : score,
        date: new Date((fakeDateTo - fakeDateFrom) * random + fakeDateFrom).toISOString(),
      };
    });

    return [
      ...fakeScores,
      ...(stats?.scores
        .filter(({ setup }) => setup.mode === singSetup.mode && setup.tolerance === singSetup.tolerance)
        .map((score) =>
          score.scores.map((singleScore) => ({
            ...singleScore,
            date: score.date,
            singSetupId: score.setup.id,
          })),
        )
        .flat() ?? []),
    ]
      .sort((a, b) => b.score - a.score)
      .slice(0, MAX_SCORES);
  }, [song.id, stats, singSetup]);

  return highScores ?? [];
}
