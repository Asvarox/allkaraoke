import dayjs from 'dayjs';
import { useCallback, useEffect, useState } from 'react';

import events from '~/modules/game-events/game-events';
import { useEventEffect } from '~/modules/game-events/hooks';
import { getAllStats, SongStats } from '~/modules/songs/stats/common';

/** Same window song selection uses to mark a song "played today", so the two agree on what "today"
 * means — a rolling 24 hours rather than a calendar day, which keeps a party running past midnight
 * counted as one night. */
const isToday = (date: string) => dayjs(date).isAfter(dayjs().subtract(1, 'days'));

/**
 * Plays recorded today across every song. Counts plays rather than distinct songs: each play is one
 * turn at the mic, so singing the same song twice is two rounds of the night, not one.
 */
export function countPlaysToday(allStats: Record<string, SongStats>): number {
  return Object.values(allStats)
    .flatMap((songStats) => songStats?.scores ?? [])
    .filter((play) => isToday(play.date)).length;
}

/**
 * How many songs have been sung today, for the "round X of the night" line.
 *
 * Counted from the stored play records rather than a counter of its own: those are the same records
 * that mark a song "played today" in song selection, so the number survives a reload and cannot
 * drift from what the rest of the app believes was played.
 *
 * Returns `null` until the records have loaded, and whenever `isLocalGame` is false. Online rounds
 * are never written to local stats, so counting them would report a number made up entirely of
 * songs sung locally earlier in the day — a round count belonging to a different night out.
 * Callers should leave the line out rather than print it.
 */
export function useSongsPlayedToday(isLocalGame: boolean): number | null {
  const [count, setCount] = useState<number | null>(null);

  const recount = useCallback(async () => {
    if (!isLocalGame) {
      setCount(null);
      return;
    }

    setCount(countPlaysToday(await getAllStats()) || null);
  }, [isLocalGame]);

  useEffect(() => {
    recount();
  }, [recount]);

  // The song that was just sung is written asynchronously as the results screen mounts, so the first
  // count can miss it. This picks it up the moment it lands.
  useEventEffect(events.songStatStored, recount);

  return count;
}
