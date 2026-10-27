import posthog from 'posthog-js';

import { GAME_MODE, Song } from '~/interfaces';
import events from '~/modules/game-events/game-events';
import SongsService from '~/modules/songs/songs-service';
import { getAllStats, getSongKey, SongStats, storeSongStatsByKey } from '~/modules/songs/stats/common';
import { getMergedTrackFactor } from '~/modules/songs/utils/merged-track-factor';
import isE2E from '~/modules/utils/is-e2-e';
import isPreRendering from '~/modules/utils/is-pre-rendering';
import { Setting } from '~/routes/settings/settings-state';

/**
 * Duets sung by anything but two players use the merged track, but used to be scored against the
 * player's own track's max, so their scores could be inflated (or deflated). Runs stored from now on
 * carry this version; older ones are rescaled once at app start and stamped with it.
 */
export const SCORING_VERSION = 2;

export interface ScoreAdjustment {
  songId: string;
  date: string;
  name: string;
  oldScore: number;
  newScore: number;
}

/** Set when past scores were adjusted and the player was not told yet. Cleared by the notice on the main menu. */
export const ScoreAdjustmentNoticeSetting = new Setting<boolean>('merged-track-score-notice', false);

/** Rescales and stamps a song's unstamped runs. `null` when there is nothing to stamp. */
export function fixMergedTrackScores(
  stats: SongStats,
  song: Song,
): { stats: SongStats; adjustments: ScoreAdjustment[] } | null {
  const adjustments: ScoreAdjustment[] = [];
  let stamped = false;

  const scores = (stats.scores ?? []).map((record) => {
    if (record.scoringVersion !== undefined || !record.setup?.players) return record;

    stamped = true;
    const { players, mode } = record.setup;
    if (players.length === 2) return { ...record, scoringVersion: SCORING_VERSION };

    const factors = players.map(({ track }) => (song.tracks[track] ? getMergedTrackFactor(song, track) : 1));
    // Co-op stores one score, the average of every player's
    const factorOf = (index: number) =>
      mode === GAME_MODE.CO_OP ? factors.reduce((sum, factor) => sum + factor, 0) / factors.length : factors[index];

    return {
      ...record,
      scoringVersion: SCORING_VERSION,
      scores: record.scores.map((entry, index) => {
        const score = entry.score * (factorOf(index) ?? 1);
        if (Math.round(score) !== Math.round(entry.score)) {
          adjustments.push({
            songId: song.id,
            date: record.date,
            name: entry.name,
            oldScore: entry.score,
            newScore: score,
          });
        }

        return { ...entry, score };
      }),
    };
  });

  return stamped ? { stats: { ...stats, scores }, adjustments } : null;
}

async function fixStoredScores() {
  const [stats, songs] = await Promise.all([getAllStats(), SongsService.getIndex()]);
  const duets = new Map(songs.filter((song) => song.tracksCount > 1).map((song) => [getSongKey(song), song]));
  const adjustments: ScoreAdjustment[] = [];

  for (const [key, songStats] of Object.entries(stats)) {
    const preview = duets.get(key);
    if (!preview || !songStats?.scores?.some((record) => record.scoringVersion === undefined)) continue;

    // A song that fails to load keeps its runs unstamped, so the next app start tries again
    const song = await SongsService.get(preview.id).catch((error: unknown) => console.error(error));
    const fixed = song && fixMergedTrackScores(songStats, song);
    if (!fixed) continue;

    await storeSongStatsByKey(key, fixed.stats);
    events.songStatStored.dispatch(key, fixed.stats);
    adjustments.push(...fixed.adjustments);
  }

  if (adjustments.length) {
    ScoreAdjustmentNoticeSetting.set(true);
    posthog.capture('mergedTrackScoresFixed', { count: adjustments.length });
  }
}

let fix: Promise<void> | null = null;

/** Starts the fix once per app start; anything acting on stored scores (the leaderboard backfill) awaits it first. */
export const fixStoredMergedTrackScores = () =>
  (fix ??=
    isE2E() || isPreRendering
      ? Promise.resolve()
      : fixStoredScores().catch((error: unknown) => console.error('Fixing merged-track scores failed', error)));
