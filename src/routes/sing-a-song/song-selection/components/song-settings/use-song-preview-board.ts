import useSWR from 'swr';

import { SongPreview } from '~/interfaces';
import { fetchSongBoard, songBoardUrl } from '~/modules/leaderboard/client';
import { getPrefilledCountry, getPrefilledName } from '~/modules/leaderboard/identity';
import { hasLeaderboard } from '~/modules/leaderboard/qualifies';
import { slotIntoBoard } from '~/modules/leaderboard/slot-into-board';
import { BoardEntry } from '~/modules/leaderboard/types';
import { SongStats } from '~/modules/songs/stats/common';
import { useSongStats } from '~/modules/songs/stats/hooks';

/** The best run this device has on record for the song at one difficulty, whoever sang it. */
const bestLocalRun = (stats: SongStats, tolerance: number) =>
  stats.scores
    .filter(({ setup }) => setup.tolerance === tolerance)
    .flatMap(({ scores, date }) => scores.map((score) => ({ ...score, date })))
    .reduce<{ name: string; score: number; date: string } | null>(
      (best, run) => (best && best.score >= run.score ? best : run),
      null,
    );

/**
 * The song's global board at one difficulty (`tolerance`, 1-based), with this device's own best
 * slotted in where it ranks — the board the post-game screen shows, before the song is sung.
 */
export default function useSongPreviewBoard(song: SongPreview, tolerance: number) {
  const stats = useSongStats(song);
  const enabled = hasLeaderboard(tolerance);
  const best = stats && bestLocalRun(stats, tolerance);

  // Not asked until the local stats are in, so the board is fetched once, already knowing the score
  // to place on it
  const { data, error, isLoading } = useSWR(
    enabled && stats ? songBoardUrl({ songId: song.id, tolerance, score: best?.score ?? null }) : null,
    fetchSongBoard,
    { revalidateOnFocus: false },
  );

  const ownRun: BoardEntry | null = best && {
    // Under the name the device shares scores with, when it has one
    name: getPrefilledName(best.name).trim() || 'You',
    country: getPrefilledCountry() || null,
    score: Math.round(best.score),
    artist: song.artist,
    title: song.title,
    songId: song.id,
    tolerance,
    createdAt: new Date(best.date).getTime(),
  };

  const board = data ? slotIntoBoard(data, ownRun) : null;

  return {
    /** The dev-only debug difficulties have no board at all. */
    enabled,
    rows: board?.rows ?? [],
    startPosition: data?.startPosition ?? 1,
    ownRun,
    ownPosition: board?.position ?? null,
    isLoading: enabled && (!stats || isLoading),
    error,
  };
}
