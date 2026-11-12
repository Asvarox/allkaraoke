/**
 * Songs dropped from the library as duplicates, see `public/songs/removed-songs.json`. The value is the
 * id of the song it was merged into, or `null` when it was removed without a merge.
 */
export type RemovedSongs = Record<string, string | null>;

/** Follows merge chains (a → b → c) to the song still in the library. `null` when the chain ends in a removal. */
export const resolveMergeTarget = (removed: RemovedSongs, id: string): string | null => {
  const seen = new Set([id]);
  let target = removed[id] ?? null;
  while (target !== null && target in removed && !seen.has(target)) {
    seen.add(target);
    target = removed[target] ?? null;
  }

  return target;
};
