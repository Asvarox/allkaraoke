import { writeFile } from 'node:fs/promises';

import dotenv from 'dotenv';

import currentSongs from '../../public/songs/index.json';
import {
  IssueBaselines,
  ISSUE_RATE_MULTIPLIER,
  judgeSongIssue,
  MIN_REPORTERS,
  SONG_QUALITY_ISSUES,
  SongQualityIssue,
} from './song-quality-scoring';
import {
  getSongQualityDismissals,
  isUnverifiedSongsAdminConfigured,
  replaceSongQualityFlags,
  SongQualityFlag,
} from './unverified-songs-admin-client';

dotenv.config({ path: '.env' });
dotenv.config({ path: '.env.local', override: true });

const LOOKBACK_MONTHS = 6;
const PAGE_SIZE = 10000;
const issuesSql = `[${SONG_QUALITY_ISSUES.map((issue) => `'${issue}'`).join(', ')}]`;

type PostHogEventRow = [
  uuid: string,
  songId: string,
  personId: string,
  issues: string[],
  timestamp: string,
  songLastUpdated: string | null,
];

// PostHog rejects OFFSET for API-key queries, so page by timestamp (inclusive) and dedupe events by uuid
const buildReportsQuery = (fromTimestamp: string | null) => `
  select uuid, properties.songId as songId, toString(person_id) as personId,
    JSONExtract(ifNull(properties.issues, '[]'), 'Array(String)') as issues,
    timestamp, properties.songLastUpdated as songLastUpdated
  from events
  where event = 'rate-song'
    and timestamp > now() - interval ${LOOKBACK_MONTHS} month
    ${fromTimestamp ? `and timestamp >= toDateTime64('${fromTimestamp}', 6, 'UTC')` : ''}
    and hasAny(issues, ${issuesSql})
    and properties.songId is not null
  order by timestamp
  limit ${PAGE_SIZE}
`;

// Catalog-wide share of players reporting each issue, summed per song like the per-song stats
const baselinesQuery = `
  select
    (select sum(players) from (
      select uniq(person_id) as players from events
      where event = 'songStarted' and timestamp > now() - interval ${LOOKBACK_MONTHS} month
        and properties.songId is not null
      group by properties.songId
    )) as players,
    issue,
    sum(reporters) as reporters
  from (
    select properties.songId as songId, issue, uniq(person_id) as reporters
    from events
    array join JSONExtract(ifNull(properties.issues, '[]'), 'Array(String)') as issue
    where event = 'rate-song' and timestamp > now() - interval ${LOOKBACK_MONTHS} month and issue in ${issuesSql}
    group by songId, issue
  )
  group by issue
`;

// Distinct players of each song since its cutoff (last update or dismissal), so both sides of the share match
const buildPlayersQuery = (cutoffs: Map<string, number>) => {
  const ids = `[${[...cutoffs.keys()].map((id) => `'${id.replaceAll("'", "\\'")}'`).join(', ')}]`;
  const times = `[${[...cutoffs.values()].join(', ')}]`;

  return `
    select properties.songId as songId, uniq(person_id) as players
    from events
    where event = 'songStarted'
      and timestamp > now() - interval ${LOOKBACK_MONTHS} month
      and properties.songId in ${ids}
      and timestamp > fromUnixTimestamp64Milli(toInt64(transform(properties.songId, ${ids}, ${times}, 0)))
    group by songId
  `;
};

const toTime = (date: string | null | undefined) => (date ? new Date(date).getTime() : NaN);

(async () => {
  const { requestPostHog } = require('../utils.cjs');
  const runQuery = async <T>(query: string) => {
    const response = await requestPostHog('query', {
      method: 'POST',
      body: JSON.stringify({ query: { kind: 'HogQLQuery', query } }),
    });
    if (!Array.isArray(response.results)) throw new Error(`Unexpected PostHog response: ${JSON.stringify(response)}`);

    return response.results as T[];
  };

  if (!isUnverifiedSongsAdminConfigured()) {
    throw new Error('Unverified songs admin endpoint env is not configured');
  }

  // Page through the whole window - publishing a partial result would drop valid flags
  const events: PostHogEventRow[] = [];
  const seenEvents = new Set<string>();
  for (let cursor: string | null = null; ;) {
    const page: PostHogEventRow[] = await runQuery<PostHogEventRow>(buildReportsQuery(cursor));

    for (const row of page) {
      if (seenEvents.has(row[0])) continue;
      seenEvents.add(row[0]);
      events.push(row);
    }

    if (page.length < PAGE_SIZE) break;
    const nextCursor: string = page[page.length - 1][4];
    if (nextCursor === cursor) throw new Error(`More than ${PAGE_SIZE} reports share timestamp ${cursor}`);
    cursor = nextCursor;
  }

  const dismissals = await getSongQualityDismissals();
  const songsById = new Map(currentSongs.map((song) => [song.id, song]));
  // songId -> issue -> distinct reporters
  const reporters = new Map<string, Map<SongQualityIssue, Set<string>>>();
  let skippedOutdated = 0;
  let skippedUnknownSong = 0;
  let skippedDismissed = 0;

  for (const [, songId, personId, issues, timestamp, songLastUpdated] of events) {
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
    // Skip reports about an older version: use the version the player rated when known, else the report time
    const currentVersion = toTime(song.lastUpdate);
    const reportedVersion = Number.isNaN(toTime(songLastUpdated)) ? toTime(timestamp) : toTime(songLastUpdated);
    if (!Number.isNaN(currentVersion) && reportedVersion < currentVersion) {
      skippedOutdated += 1;
      continue;
    }

    const songReporters = reporters.get(songId) ?? new Map<SongQualityIssue, Set<string>>();
    for (const issue of SONG_QUALITY_ISSUES.filter((issue) => issues.includes(issue))) {
      songReporters.set(issue, (songReporters.get(issue) ?? new Set()).add(personId));
    }
    reporters.set(songId, songReporters);
  }

  const baselineRows = await runQuery<[players: number, issue: SongQualityIssue, reporters: number]>(baselinesQuery);
  const baselines = Object.fromEntries(SONG_QUALITY_ISSUES.map((issue) => [issue, 0])) as IssueBaselines;
  for (const [players, issue, issueReporters] of baselineRows) {
    if (players > 0) baselines[issue] = issueReporters / players;
  }

  // Only songs that could pass the reporter minimum need their player counts
  const candidates = [...reporters.entries()].filter(([, issues]) =>
    [...issues.values()].some((people) => people.size >= MIN_REPORTERS),
  );
  const cutoffs = new Map(
    candidates.map(([songId]) => [
      songId,
      Math.max(toTime(songsById.get(songId)?.lastUpdate) || 0, dismissals[songId] ?? 0),
    ]),
  );
  const players = new Map(
    cutoffs.size ? await runQuery<[songId: string, players: number]>(buildPlayersQuery(cutoffs)) : [],
  );

  const flags: SongQualityFlag[] = candidates.flatMap(([songId, issueReporters]) => {
    const song = songsById.get(songId)!;
    const songPlayers = players.get(songId) ?? 0;
    const reportCounts: SongQualityFlag['reportCounts'] = {};
    const issues = SONG_QUALITY_ISSUES.filter((issue) => {
      const count = issueReporters.get(issue)?.size ?? 0;
      if (count) reportCounts[issue] = count;

      return judgeSongIssue({ reporters: count, players: songPlayers }, baselines[issue]).flagged;
    });

    if (!issues.length) return [];

    return [
      {
        songId,
        artist: song.artist,
        title: song.title,
        language: song.language,
        videoId: song.video ?? '',
        issues,
        reportCounts,
        players: Math.max(songPlayers, ...Object.values(reportCounts)),
      },
    ];
  });

  await replaceSongQualityFlags(flags);

  const summary = {
    rule: `>= ${MIN_REPORTERS} distinct reporters and 95% lower bound of report share > ${ISSUE_RATE_MULTIPLIER}x catalog share`,
    baselines,
    eventsAnalyzed: seenEvents.size,
    skippedOutdated,
    skippedUnknownSong,
    skippedDismissed,
    flaggedSongs: flags.length,
    byIssue: Object.fromEntries(
      SONG_QUALITY_ISSUES.map((issue) => [issue, flags.filter((flag) => flag.issues.includes(issue)).length]),
    ),
    flags,
  };

  if (process.env.SONG_QUALITY_SUMMARY_PATH) {
    await writeFile(process.env.SONG_QUALITY_SUMMARY_PATH, JSON.stringify(summary, null, 2));
  }

  console.log(JSON.stringify(summary, null, 2));
})();
