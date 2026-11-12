import events from '~/modules/game-events/game-events';
import { getAllStats, removeSongStatsByKey, SongStats, storeSongStatsByKey } from '~/modules/songs/stats/common';
import { RemovedSongs, resolveMergeTarget } from '~/modules/songs/utils/removed-songs';

const runKey = (run: SongStats['scores'][number]) => `${run.date}|${JSON.stringify(run.scores)}`;

/** Skips runs already present, so re-merging after an interrupted run doesn't duplicate them. */
const combineStats = (into: SongStats | undefined, from: SongStats): SongStats => {
  const existing = new Set((into?.scores ?? []).map(runKey));
  const added = (from.scores ?? []).filter((run) => !existing.has(runKey(run)));
  const duplicates = (from.scores?.length ?? 0) - added.length;
  const scores = [...(into?.scores ?? []), ...added].sort((a, b) => a.date.localeCompare(b.date));

  return { plays: (into?.plays ?? 0) + Math.max(0, (from.plays ?? 0) - duplicates), scores };
};

/** Moves the history of merged songs onto the songs they were merged into. */
export function mergeRemovedSongStats(stats: Record<string, SongStats>, removed: RemovedSongs) {
  const updated: Record<string, SongStats> = {};
  const removedKeys: string[] = [];

  for (const [key, songStats] of Object.entries(stats)) {
    if (!(key in removed) || !songStats) continue;
    const target = resolveMergeTarget(removed, key);
    // History of a song removed without a merge stays, it is harmless and the song may come back
    if (target === null) continue;

    updated[target] = combineStats(updated[target] ?? stats[target], songStats);
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
