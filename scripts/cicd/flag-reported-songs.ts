import { writeFile } from 'node:fs/promises';

import dotenv from 'dotenv';

import currentSongs from '../../public/songs/index.json';
import {
  isUnverifiedSongsAdminConfigured,
  replaceSongQualityFlags,
  SongQualityFlag,
  SongQualityIssue,
} from './unverified-songs-admin-client';

dotenv.config({ path: '.env' });
dotenv.config({ path: '.env.local', override: true });

const ISSUES: SongQualityIssue[] = ['not-in-sync', 'too-loud', 'too-quiet'];
// A song is flagged when it has MORE than this many reports of the same issue
const REPORT_THRESHOLD = 5;
const LOOKBACK_MONTHS = 6;

const PAGE_SIZE = 10000;

type PostHogRow = [songId: string, issue: SongQualityIssue, timestamp: string, songLastUpdated: string | null];

const buildQuery = (offset: number) => `
  select properties.songId as songId, issue, timestamp, properties.songLastUpdated as songLastUpdated
  from events
  array join JSONExtract(ifNull(properties.issues, '[]'), 'Array(String)') as issue
  where event = 'rate-song'
    and timestamp > now() - interval ${LOOKBACK_MONTHS} month
    and issue in (${ISSUES.map((issue) => `'${issue}'`).join(', ')})
    and properties.songId is not null
  order by timestamp, uuid, issue
  limit ${PAGE_SIZE} offset ${offset}
`;

const toTime = (date: string | null | undefined) => (date ? new Date(date).getTime() : NaN);

(async () => {
  const { requestPostHog } = require('../utils.cjs');

  if (!isUnverifiedSongsAdminConfigured()) {
    throw new Error('Unverified songs admin endpoint env is not configured');
  }

  // Page through the whole window - publishing a partial result would drop valid flags
  const rows: PostHogRow[] = [];
  for (let offset = 0; ; offset += PAGE_SIZE) {
    const response = await requestPostHog('query', {
      method: 'POST',
      body: JSON.stringify({ query: { kind: 'HogQLQuery', query: buildQuery(offset) } }),
    });
    const page = response.results as PostHogRow[] | undefined;
    if (!Array.isArray(page)) throw new Error(`Unexpected PostHog response: ${JSON.stringify(response)}`);

    rows.push(...page);
    if (page.length < PAGE_SIZE) break;
  }

  // Skip reports about an older version of the song: compare the version the player rated when known,
  // otherwise fall back to when the report was made
  const songsById = new Map(currentSongs.map((song) => [song.id, song]));
  const counts = new Map<string, Partial<Record<SongQualityIssue, number>>>();
  let skippedOutdated = 0;
  let skippedUnknownSong = 0;

  for (const [songId, issue, timestamp, songLastUpdated] of rows) {
    const song = songsById.get(songId);
    if (!song) {
      skippedUnknownSong += 1;
      continue;
    }
    const currentVersion = toTime(song.lastUpdate);
    const reportedVersion = Number.isNaN(toTime(songLastUpdated)) ? toTime(timestamp) : toTime(songLastUpdated);
    if (!Number.isNaN(currentVersion) && reportedVersion < currentVersion) {
      skippedOutdated += 1;
      continue;
    }

    const songCounts = counts.get(songId) ?? {};
    songCounts[issue] = (songCounts[issue] ?? 0) + 1;
    counts.set(songId, songCounts);
  }

  const flags: SongQualityFlag[] = [...counts.entries()].flatMap(([songId, reportCounts]) => {
    const issues = ISSUES.filter((issue) => (reportCounts[issue] ?? 0) > REPORT_THRESHOLD);
    const song = songsById.get(songId)!;

    return issues.length
      ? [
          {
            songId,
            artist: song.artist,
            title: song.title,
            language: song.language,
            videoId: song.video ?? '',
            issues,
            reportCounts,
          },
        ]
      : [];
  });

  await replaceSongQualityFlags(flags);

  const summary = {
    reportsAnalyzed: rows.length,
    skippedOutdated,
    skippedUnknownSong,
    flaggedSongs: flags.length,
    byIssue: Object.fromEntries(
      ISSUES.map((issue) => [issue, flags.filter((flag) => flag.issues.includes(issue)).length]),
    ),
    flags,
  };

  if (process.env.SONG_QUALITY_SUMMARY_PATH) {
    await writeFile(process.env.SONG_QUALITY_SUMMARY_PATH, JSON.stringify(summary, null, 2));
  }

  console.log(JSON.stringify(summary, null, 2));
})();
