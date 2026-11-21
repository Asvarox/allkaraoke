export const SONG_QUALITY_ISSUES = ['not-in-sync', 'too-loud', 'too-quiet', 'duration-shift'] as const;

export type SongQualityIssue = (typeof SONG_QUALITY_ISSUES)[number];

/** Set by the local duration-shift script: the YouTube video changed length and it couldn't be fixed automatically */
export interface DurationShiftDetails {
  previousDuration: number;
  currentDuration: number;
  /** Offset of the new video vs the old one (s), null when no consistent offset was found */
  offset: number | null;
  detectedAt: number;
  note?: string;
}

export interface SongQualityFlag {
  songId: string;
  artist: string;
  title: string;
  language: string[];
  videoId: string;
  issues: SongQualityIssue[];
  reportCounts: Partial<Record<SongQualityIssue, number>>;
  durationShift?: DurationShiftDetails;
}

export interface SongQualityFlagsDocument {
  generatedAt: number;
  songs: SongQualityFlag[];
}

/** When each song's reports were last dismissed (ms). The weekly job ignores reports made before that. */
export type SongQualityDismissals = Record<string, number>;

const SONG_QUALITY_FLAGS_KEY = 'song-quality-flags';
const SONG_QUALITY_DISMISSALS_KEY = 'song-quality-dismissals';
// Older dismissals no longer matter - the weekly job only looks this far back
const DISMISSAL_RETENTION_MS = 200 * 24 * 60 * 60 * 1000;

const isSongQualityIssue = (value: unknown): value is SongQualityIssue =>
  SONG_QUALITY_ISSUES.includes(value as SongQualityIssue);

const isFiniteNumber = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value);

const normalizeDurationShift = (payload: unknown): DurationShiftDetails | undefined => {
  if (!payload || typeof payload !== 'object') return undefined;

  const details = payload as Partial<DurationShiftDetails>;
  if (!isFiniteNumber(details.previousDuration) || !isFiniteNumber(details.currentDuration)) return undefined;

  return {
    previousDuration: details.previousDuration,
    currentDuration: details.currentDuration,
    offset: isFiniteNumber(details.offset) ? details.offset : null,
    detectedAt: isFiniteNumber(details.detectedAt) ? details.detectedAt : 0,
    ...(typeof details.note === 'string' && details.note ? { note: details.note } : {}),
  };
};

export const normalizeSongQualityFlag = (payload: unknown): SongQualityFlag | null => {
  if (!payload || typeof payload !== 'object') return null;

  const flag = payload as Partial<SongQualityFlag>;
  if (typeof flag.songId !== 'string' || !flag.songId || !Array.isArray(flag.issues)) return null;
  if (typeof flag.artist !== 'string' || typeof flag.title !== 'string') return null;

  const issues = [...new Set(flag.issues.filter(isSongQualityIssue))];
  if (!issues.length) return null;

  const reportCounts: SongQualityFlag['reportCounts'] = {};
  for (const issue of issues) {
    const count = flag.reportCounts?.[issue];
    if (typeof count === 'number' && Number.isFinite(count)) reportCounts[issue] = count;
  }

  const durationShift = issues.includes('duration-shift') ? normalizeDurationShift(flag.durationShift) : undefined;

  return {
    songId: flag.songId,
    artist: flag.artist,
    title: flag.title,
    language: Array.isArray(flag.language) ? flag.language.filter((lang) => typeof lang === 'string') : [],
    videoId: typeof flag.videoId === 'string' ? flag.videoId : '',
    issues,
    reportCounts,
    ...(durationShift ? { durationShift } : {}),
  };
};

export const getSongQualityFlags = async (kvNamespace: KVNamespace): Promise<SongQualityFlagsDocument> => {
  const stored = await kvNamespace.get<SongQualityFlagsDocument>(SONG_QUALITY_FLAGS_KEY, 'json');

  return {
    generatedAt: stored?.generatedAt ?? 0,
    songs: (stored?.songs ?? []).flatMap((flag) => {
      const normalized = normalizeSongQualityFlag(flag);
      return normalized ? [normalized] : [];
    }),
  };
};

const mergeFlags = (existing: SongQualityFlag | undefined, update: SongQualityFlag): SongQualityFlag => {
  if (!existing) return update;

  const durationShift = update.durationShift ?? existing.durationShift;

  return {
    ...existing,
    ...update,
    issues: [...new Set([...existing.issues, ...update.issues])],
    reportCounts: { ...existing.reportCounts, ...update.reportCounts },
    ...(durationShift ? { durationShift } : {}),
  };
};

/** Replaces the player-report flags (weekly job). Duration shifts come from a separate script, so they are kept. */
export const replaceSongQualityFlags = async (kvNamespace: KVNamespace, songs: SongQualityFlag[]) => {
  const current = await getSongQualityFlags(kvNamespace);
  const merged = new Map(songs.map((flag) => [flag.songId, flag]));

  for (const flag of current.songs) {
    if (!flag.issues.includes('duration-shift')) continue;

    const durationShiftOnly: SongQualityFlag = { ...flag, issues: ['duration-shift'], reportCounts: {} };
    merged.set(flag.songId, mergeFlags(merged.get(flag.songId), durationShiftOnly));
  }

  const document: SongQualityFlagsDocument = { generatedAt: Date.now(), songs: [...merged.values()] };
  await kvNamespace.put(SONG_QUALITY_FLAGS_KEY, JSON.stringify(document));
};

/** Adds the given flags' issues to the stored ones, keeping everything else */
export const addSongQualityFlags = async (kvNamespace: KVNamespace, songs: SongQualityFlag[]) => {
  const current = await getSongQualityFlags(kvNamespace);
  const merged = new Map(current.songs.map((flag) => [flag.songId, flag]));

  for (const flag of songs) {
    merged.set(flag.songId, mergeFlags(merged.get(flag.songId), flag));
  }

  await kvNamespace.put(SONG_QUALITY_FLAGS_KEY, JSON.stringify({ ...current, songs: [...merged.values()] }));
};

export const getSongQualityDismissals = async (kvNamespace: KVNamespace): Promise<SongQualityDismissals> => {
  const stored = await kvNamespace.get<SongQualityDismissals>(SONG_QUALITY_DISMISSALS_KEY, 'json');

  return Object.fromEntries(Object.entries(stored ?? {}).filter(([, dismissedAt]) => typeof dismissedAt === 'number'));
};

const recordSongQualityDismissal = async (kvNamespace: KVNamespace, songId: string, dismissedAt: number) => {
  const current = await getSongQualityDismissals(kvNamespace);
  const dismissals = Object.fromEntries(
    Object.entries({ ...current, [songId]: dismissedAt }).filter(
      ([, time]) => time > dismissedAt - DISMISSAL_RETENTION_MS,
    ),
  );

  await kvNamespace.put(SONG_QUALITY_DISMISSALS_KEY, JSON.stringify(dismissals));
};

export const removeSongQualityFlag = async (kvNamespace: KVNamespace, songId: string) => {
  const current = await getSongQualityFlags(kvNamespace);
  const songs = current.songs.filter((flag) => flag.songId !== songId);

  if (songs.length === current.songs.length) return false;

  await recordSongQualityDismissal(kvNamespace, songId, Date.now());
  await kvNamespace.put(SONG_QUALITY_FLAGS_KEY, JSON.stringify({ ...current, songs }));
  return true;
};
