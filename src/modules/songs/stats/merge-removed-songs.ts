import events from '~/modules/game-events/game-events';
import { getAllStats, removeSongStatsByKey, SongStats, storeSongStatsByKey } from '~/modules/songs/stats/common';
import { RemovedSongs, resolveMergeTarget } from '~/modules/songs/utils/removed-songs';

type MergeRecords = NonNullable<SongStats['mergedFrom']>;

const unionRecords = (into: MergeRecords = {}, from: MergeRecords = {}): MergeRecords => {
  const records = { ...into };
  for (const [key, record] of Object.entries(from)) {
    records[key] = {
      dates: [...new Set([...(records[key]?.dates ?? []), ...record.dates])],
      plays: Math.max(records[key]?.plays ?? 0, record.plays),
    };
  }
  return records;
};

/**
 * Moves the history of merged songs onto the songs they were merged into.
 *
 * Each parent remembers, per old key, the dates of the runs it took and the old key's play count at that point.
 * A retry after an interrupted merge (old key not removed yet) then adds only what was played since, and history
 * recorded under an old key after its merge (e.g. a local copy of the removed song) is moved again, not dropped.
 * Records are dates, not scores, as the merged-track fix may rescale scores in between.
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
    updated[target] = { ...parent, mergedFrom: unionRecords(parent.mergedFrom, songStats.mergedFrom) };
  }

  for (const { key, songStats, target } of sources) {
    const parent = parentOf(target);
    const record = parent.mergedFrom?.[key];
    const taken = new Set(record?.dates);
    const scores = songStats.scores ?? [];
    const newRuns = scores.filter((run) => !taken.has(run.date));
    // The key still holds what was taken (interrupted merge). New plays always add a run, so plays-only history is old
    const stillHoldsTaken = scores.length === 0 || scores.some((run) => taken.has(run.date));
    const alreadyCounted = record && stillHoldsTaken ? record.plays : 0;
    const newPlays = Math.max(0, (songStats.plays ?? 0) - alreadyCounted);

    if (newRuns.length > 0 || newPlays > 0) {
      updated[target] = {
        ...parent,
        plays: (parent.plays ?? 0) + newPlays,
        scores: [...(parent.scores ?? []), ...newRuns].sort((a, b) => a.date.localeCompare(b.date)),
        mergedFrom: {
          ...parent.mergedFrom,
          // Play count of the key as it is now, so a retry of this merge subtracts exactly that
          [key]: { dates: [...new Set([...taken, ...scores.map((run) => run.date)])], plays: songStats.plays ?? 0 },
        },
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
