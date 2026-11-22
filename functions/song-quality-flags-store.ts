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
  /** Distinct players who reported each issue */
  reportCounts: Partial<Record<SongQualityIssue, number>>;
  /** Distinct players of the current version, 0 when unknown */
  players: number;
  durationShift?: DurationShiftDetails;
}

export interface SongQualityFlagsDocument {
  generatedAt: number;
  songs: SongQualityFlag[];
}

/** When each song's reports were last dismissed (ms). The weekly job ignores reports made before that. */
export type SongQualityDismissals = Record<string, number>;

const SONG_QUALITY_FLAGS_KEY = 'song-quality-flags';
const DURATION_SHIFT_FLAGS_KEY = 'song-duration-shift-flags';
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
    players: typeof flag.players === 'number' && Number.isFinite(flag.players) ? flag.players : 0,
    ...(durationShift ? { durationShift } : {}),
  };
};

const normalizeFlags = (songs: unknown[] | undefined) =>
  (songs ?? []).flatMap((flag) => {
    const normalized = normalizeSongQualityFlag(flag);
    return normalized ? [normalized] : [];
  });

const getReportFlags = async (kvNamespace: KVNamespace) => {
  const stored = await kvNamespace.get<SongQualityFlagsDocument>(SONG_QUALITY_FLAGS_KEY, 'json');

  return { generatedAt: stored?.generatedAt ?? 0, songs: normalizeFlags(stored?.songs) };
};

const getDurationShiftFlags = async (kvNamespace: KVNamespace) =>
  normalizeFlags((await kvNamespace.get<SongQualityFlag[]>(DURATION_SHIFT_FLAGS_KEY, 'json')) ?? undefined);

/** Player-report flags (weekly job) and duration-shift flags (local script) live under separate keys, so their
 * writers never overwrite each other. Merged per song here, the report flag's metadata wins. */
export const getSongQualityFlags = async (kvNamespace: KVNamespace): Promise<SongQualityFlagsDocument> => {
  const [reports, durationShifts] = await Promise.all([
    getReportFlags(kvNamespace),
    getDurationShiftFlags(kvNamespace),
  ]);
  const merged = new Map(reports.songs.map((flag) => [flag.songId, flag]));

  for (const flag of durationShifts) {
    const reportFlag = merged.get(flag.songId);
    merged.set(
      flag.songId,
      reportFlag
        ? {
            ...reportFlag,
            issues: [...new Set([...reportFlag.issues, 'duration-shift' as const])],
            ...(flag.durationShift ? { durationShift: flag.durationShift } : {}),
          }
        : flag,
    );
  }

  return { generatedAt: reports.generatedAt, songs: [...merged.values()] };
};

/** Replaces the player-report flags (weekly job). Duration-shift flags are stored apart and stay. */
export const replaceSongQualityFlags = async (kvNamespace: KVNamespace, songs: SongQualityFlag[]) => {
  const reportFlags = songs.flatMap((flag) => {
    const issues = flag.issues.filter((issue) => issue !== 'duration-shift');
    return issues.length ? [{ ...flag, issues, durationShift: undefined }] : [];
  });
  const document: SongQualityFlagsDocument = { generatedAt: Date.now(), songs: reportFlags };
  await kvNamespace.put(SONG_QUALITY_FLAGS_KEY, JSON.stringify(document));
};

/** Adds or replaces duration-shift flags (local script, run by hand - nothing else writes this key) */
export const addDurationShiftFlags = async (kvNamespace: KVNamespace, songs: SongQualityFlag[]) => {
  const merged = new Map((await getDurationShiftFlags(kvNamespace)).map((flag) => [flag.songId, flag]));

  for (const flag of songs) {
    if (!flag.issues.includes('duration-shift')) continue;
    merged.set(flag.songId, { ...flag, issues: ['duration-shift'], reportCounts: {}, players: 0 });
  }

  await kvNamespace.put(DURATION_SHIFT_FLAGS_KEY, JSON.stringify([...merged.values()]));
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
  const [reports, durationShifts] = await Promise.all([
    getReportFlags(kvNamespace),
    getDurationShiftFlags(kvNamespace),
  ]);
  const reportSongs = reports.songs.filter((flag) => flag.songId !== songId);
  const durationShiftSongs = durationShifts.filter((flag) => flag.songId !== songId);
  const removedReport = reportSongs.length !== reports.songs.length;
  const removedDurationShift = durationShiftSongs.length !== durationShifts.length;

  if (!removedReport && !removedDurationShift) return false;

  await recordSongQualityDismissal(kvNamespace, songId, Date.now());
  if (removedReport) {
    await kvNamespace.put(SONG_QUALITY_FLAGS_KEY, JSON.stringify({ ...reports, songs: reportSongs }));
  }
  if (removedDurationShift) {
    await kvNamespace.put(DURATION_SHIFT_FLAGS_KEY, JSON.stringify(durationShiftSongs));
  }
  return true;
};
