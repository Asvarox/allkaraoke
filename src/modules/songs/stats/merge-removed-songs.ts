import events from '~/modules/game-events/game-events';
import { getAllStats, removeSongStatsByKey, SongStats, storeSongStatsByKey } from '~/modules/songs/stats/common';
import { RemovedSongs, resolveMergeTarget } from '~/modules/songs/utils/removed-songs';

/**
 * Moves the runs of merged songs onto the songs they were merged into. Runs are matched by date (scores may have been
 * rescaled by the merged-track fix), so retries, chains and re-created old keys never add a run twice.
 * Only runs move: song end recounts `plays` from the runs anyway.
 */
export function mergeRemovedSongStats(stats: Record<string, SongStats>, removed: RemovedSongs) {
  const updated: Record<string, SongStats> = {};
  const removedKeys: string[] = [];

  for (const [key, songStats] of Object.entries(stats)) {
    if (!(key in removed) || !songStats) continue;
    const target = resolveMergeTarget(removed, key);
    // History of a song removed without a merge (or in a merge loop) stays, it may come back
    if (target === null) continue;

    const parent = updated[target] ?? stats[target] ?? { plays: 0, scores: [] };
    const held = new Set((parent.scores ?? []).map((run) => run.date));
    const newRuns = (songStats.scores ?? []).filter((run) => !held.has(run.date));

    if (newRuns.length > 0) {
      updated[target] = {
        ...parent,
        plays: (parent.plays ?? 0) + newRuns.length,
        scores: [...(parent.scores ?? []), ...newRuns].sort((a, b) => a.date.localeCompare(b.date)),
      };
    }
    removedKeys.push(key);
  }

  return { updated, removedKeys };
}

export async function mergeStoredRemovedSongStats() {
  const response = await fetch('/songs/removed-songs.json');
  if (!response.ok) return;
  const removed: RemovedSongs = await response.json();
  if (Object.keys(removed).length === 0) return;

  const { updated, removedKeys } = mergeRemovedSongStats(await getAllStats(), removed);

  for (const [key, stats] of Object.entries(updated)) {
    await storeSongStatsByKey(key, stats);
    events.songStatStored.dispatch(key, stats);
  }
  // Removed only after every parent is stored, so an interrupted run never loses history
  for (const key of removedKeys) {
    await removeSongStatsByKey(key);
  }
}
