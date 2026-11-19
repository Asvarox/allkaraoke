import { writeFile } from 'node:fs/promises';

import dotenv from 'dotenv';

import currentSongs from '../../public/songs/index.json';
import {
  getSongQualityDismissals,
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

type PostHogEventRow = [
  uuid: string,
  songId: string,
  issues: string[],
  timestamp: string,
  songLastUpdated: string | null,
];
type ReportRow = [songId: string, issue: SongQualityIssue, timestamp: string, songLastUpdated: string | null];

// PostHog rejects OFFSET for API-key queries, so page by timestamp (inclusive) and dedupe events by uuid
const buildQuery = (fromTimestamp: string | null) => `
  select uuid, properties.songId as songId, JSONExtract(ifNull(properties.issues, '[]'), 'Array(String)') as issues,
    timestamp, properties.songLastUpdated as songLastUpdated
  from events
  where event = 'rate-song'
    and timestamp > now() - interval ${LOOKBACK_MONTHS} month
    ${fromTimestamp ? `and timestamp >= toDateTime64('${fromTimestamp}', 6, 'UTC')` : ''}
    and hasAny(issues, [${ISSUES.map((issue) => `'${issue}'`).join(', ')}])
    and properties.songId is not null
  order by timestamp
  limit ${PAGE_SIZE}
`;

const toTime = (date: string | null | undefined) => (date ? new Date(date).getTime() : NaN);

(async () => {
  const { requestPostHog } = require('../utils.cjs');

  if (!isUnverifiedSongsAdminConfigured()) {
    throw new Error('Unverified songs admin endpoint env is not configured');
  }

  // Page through the whole window - publishing a partial result would drop valid flags
  const rows: ReportRow[] = [];
  const seenEvents = new Set<string>();
  for (let cursor: string | null = null; ;) {
    const response = await requestPostHog('query', {
      method: 'POST',
      body: JSON.stringify({ query: { kind: 'HogQLQuery', query: buildQuery(cursor) } }),
    });
    const page = response.results as PostHogEventRow[] | undefined;
    if (!Array.isArray(page)) throw new Error(`Unexpected PostHog response: ${JSON.stringify(response)}`);

    for (const [uuid, songId, issues, timestamp, songLastUpdated] of page) {
      if (seenEvents.has(uuid)) continue;
      seenEvents.add(uuid);
      issues
        .filter((issue): issue is SongQualityIssue => ISSUES.includes(issue as SongQualityIssue))
        .forEach((issue) => rows.push([songId, issue, timestamp, songLastUpdated]));
    }

    if (page.length < PAGE_SIZE) break;
    const nextCursor = page[page.length - 1][3];
    if (nextCursor === cursor) throw new Error(`More than ${PAGE_SIZE} reports share timestamp ${cursor}`);
    cursor = nextCursor;
  }

  // Skip reports about an older version of the song: compare the version the player rated when known,
  // otherwise fall back to when the report was made
  const dismissals = await getSongQualityDismissals();
  const songsById = new Map(currentSongs.map((song) => [song.id, song]));
  const counts = new Map<string, Partial<Record<SongQualityIssue, number>>>();
  let skippedOutdated = 0;
  let skippedUnknownSong = 0;
  let skippedDismissed = 0;

  for (const [songId, issue, timestamp, songLastUpdated] of rows) {
    const song = songsById.get(songId);
    if (!song) {
      skippedUnknownSong += 1;
      continue;
    }
    // An admin already reviewed these reports
    const dismissedAt = dismissals[songId];
    if (dismissedAt && toTime(timestamp) <= dismissedAt) {
      skippedDismissed += 1;
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
    eventsAnalyzed: seenEvents.size,
    reportsAnalyzed: rows.length,
    skippedOutdated,
    skippedUnknownSong,
    skippedDismissed,
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
