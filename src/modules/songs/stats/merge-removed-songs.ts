import events from '~/modules/game-events/game-events';
import { getAllStats, removeSongStatsByKey, SongStats, storeSongStatsByKey } from '~/modules/songs/stats/common';
import { RemovedSongs, resolveMergeTarget } from '~/modules/songs/utils/removed-songs';

/**
 * Moves the runs of merged songs onto the songs they were merged into.
 *
 * Each parent remembers, per old key, the dates of the runs it took (dates, as the merged-track fix may rescale
 * scores). A retry after an interrupted merge adds nothing twice, and runs recorded under an old key after its merge
 * (e.g. a local copy of the removed song) are moved too. Only runs move: song end recounts `plays` from the runs anyway.
 */
export function mergeRemovedSongStats(stats: Record<string, SongStats>, removed: RemovedSongs) {
  const updated: Record<string, SongStats> = {};
  const removedKeys: string[] = [];
  const parentOf = (target: string): SongStats => updated[target] ?? stats[target] ?? { plays: 0, scores: [] };

  const sources = Object.entries(stats).flatMap(([key, songStats]) => {
    if (!(key in removed) || !songStats) return [];
    const target = resolveMergeTarget(removed, key);
    // History of a song removed without a merge (or in a merge loop) stays, it may come back
    return target === null ? [] : [{ key, songStats, target }];
  });

  // Inherit what merged sources already took from others first, so overlapping histories count once in any order
  for (const { songStats, target } of sources) {
    if (!songStats.mergedFrom) continue;
    const parent = parentOf(target);
    const mergedFrom = { ...parent.mergedFrom };
    for (const [key, dates] of Object.entries(songStats.mergedFrom)) {
      mergedFrom[key] = [...new Set([...(mergedFrom[key] ?? []), ...dates])];
    }
    updated[target] = { ...parent, mergedFrom };
  }

  for (const { key, songStats, target } of sources) {
    const parent = parentOf(target);
    const taken = new Set(parent.mergedFrom?.[key]);
    const newRuns = (songStats.scores ?? []).filter((run) => !taken.has(run.date));

    if (newRuns.length > 0) {
      updated[target] = {
        ...parent,
        plays: (parent.plays ?? 0) + newRuns.length,
        scores: [...(parent.scores ?? []), ...newRuns].sort((a, b) => a.date.localeCompare(b.date)),
        mergedFrom: { ...parent.mergedFrom, [key]: [...taken, ...newRuns.map((run) => run.date)] },
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
