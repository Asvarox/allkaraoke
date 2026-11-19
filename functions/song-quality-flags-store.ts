export const SONG_QUALITY_ISSUES = ['not-in-sync', 'too-loud', 'too-quiet'] as const;

export type SongQualityIssue = (typeof SONG_QUALITY_ISSUES)[number];

export interface SongQualityFlag {
  songId: string;
  artist: string;
  title: string;
  language: string[];
  videoId: string;
  issues: SongQualityIssue[];
  reportCounts: Partial<Record<SongQualityIssue, number>>;
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

  return {
    songId: flag.songId,
    artist: flag.artist,
    title: flag.title,
    language: Array.isArray(flag.language) ? flag.language.filter((lang) => typeof lang === 'string') : [],
    videoId: typeof flag.videoId === 'string' ? flag.videoId : '',
    issues,
    reportCounts,
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

export const replaceSongQualityFlags = async (kvNamespace: KVNamespace, songs: SongQualityFlag[]) => {
  const document: SongQualityFlagsDocument = { generatedAt: Date.now(), songs };
  await kvNamespace.put(SONG_QUALITY_FLAGS_KEY, JSON.stringify(document));
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
