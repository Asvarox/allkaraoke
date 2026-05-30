import dayjs from 'dayjs';
import { useAsync } from 'react-use';
import { SingSetup, SongPreview } from '~/interfaces';
import SongsService from '~/modules/songs/songs-service';
import { getAllStats, getSongKey } from '~/modules/songs/stats/common';

export interface PlayHistoryEntry {
  songKey: string;
  // null when the song has been removed from the library
  song: SongPreview | null;
  date: string;
  progress: number | undefined;
  mode: SingSetup['mode'];
  scores: Array<{ name: string; score: number }>;
}

export interface PlayHistoryGroup {
  // Human-readable label: "Today", "Yesterday", or "18 May 2026"
  label: string;
  entries: PlayHistoryEntry[];
}

export function groupEntriesByDay(entries: PlayHistoryEntry[]): PlayHistoryGroup[] {
  const groups: PlayHistoryGroup[] = [];
  let currentDayKey = '';
  let currentGroup: PlayHistoryGroup | null = null;

  const today = dayjs();

  for (const entry of entries) {
    const entryDay = dayjs(entry.date);
    const dayKey = entryDay.format('YYYY-MM-DD');

    if (dayKey !== currentDayKey) {
      currentDayKey = dayKey;

      let label: string;
      if (entryDay.isSame(today, 'day')) {
        label = 'Today';
      } else if (entryDay.isSame(today.subtract(1, 'day'), 'day')) {
        label = 'Yesterday';
      } else {
        label = entryDay.format('D MMMM YYYY');
      }

      currentGroup = { label, entries: [] };
      groups.push(currentGroup);
    }

    currentGroup!.entries.push(entry);
  }

  return groups;
}

export function usePlayHistory(): { groups: PlayHistoryGroup[]; loading: boolean } {
  const statsAsync = useAsync(() => getAllStats(), []);
  const songIndexAsync = useAsync(() => SongsService.getIndex(), []);

  if (statsAsync.loading || songIndexAsync.loading) {
    return { groups: [], loading: true };
  }

  // Treat errors or missing values as empty (e.g. IndexedDB unavailable)
  if (statsAsync.error || songIndexAsync.error || !statsAsync.value || !songIndexAsync.value) {
    return { groups: [], loading: false };
  }

  // Build hash → SongPreview lookup map
  const songsByKey = new Map<string, SongPreview>();
  for (const song of songIndexAsync.value) {
    songsByKey.set(getSongKey(song), song);
  }

  // Flatten all score entries across all songs
  const flatEntries: PlayHistoryEntry[] = [];
  for (const [key, stats] of Object.entries(statsAsync.value)) {
    const song = songsByKey.get(key) ?? null;
    for (const scoreEntry of stats.scores) {
      flatEntries.push({
        songKey: key,
        song,
        date: scoreEntry.date,
        progress: scoreEntry.progress,
        mode: scoreEntry.setup.mode,
        scores: scoreEntry.scores,
      });
    }
  }

  // Sort newest first
  flatEntries.sort((a, b) => b.date.localeCompare(a.date));

  return { groups: groupEntriesByDay(flatEntries), loading: false };
}
