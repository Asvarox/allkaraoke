import events from '~/modules/game-events/game-events';
import { getAllStats, removeSongStatsByKey, SongStats, storeSongStatsByKey } from '~/modules/songs/stats/common';
import { RemovedSongs, resolveMergeTarget } from '~/modules/songs/utils/removed-songs';

const combineStats = (into: SongStats | undefined, from: SongStats, fromKey: string): SongStats => ({
  ...into,
  plays: (into?.plays ?? 0) + (from.plays ?? 0),
  scores: [...(into?.scores ?? []), ...(from.scores ?? [])].sort((a, b) => a.date.localeCompare(b.date)),
  mergedFrom: [...(into?.mergedFrom ?? []), fromKey],
});

/** Moves the history of merged songs onto the songs they were merged into. */
export function mergeRemovedSongStats(stats: Record<string, SongStats>, removed: RemovedSongs) {
  const updated: Record<string, SongStats> = {};
  const removedKeys: string[] = [];

  for (const [key, songStats] of Object.entries(stats)) {
    if (!(key in removed) || !songStats) continue;
    const target = resolveMergeTarget(removed, key);
    // History of a song removed without a merge stays, it is harmless and the song may come back
    if (target === null) continue;

    const parent = updated[target] ?? stats[target];
    // Already merged by a run interrupted before the old key was removed
    if (!parent?.mergedFrom?.includes(key)) updated[target] = combineStats(parent, songStats, key);
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
