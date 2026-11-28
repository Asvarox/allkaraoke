import { writeFile } from 'node:fs/promises';

import dotenv from 'dotenv';

import currentSongs from '../../public/songs/index.json';
import { getSongVersionKey, SongVersion } from '../../src/modules/songs/song-version';
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
  instrumental: boolean,
  videoId: string | null,
];

// The instrumental is a separate video, so its reports and players are counted apart from the original's
const flagKeySql = `if(toString(properties.instrumental) = 'true',
  concat(toString(properties.songId), ':instrumental'), toString(properties.songId))`;

// PostHog rejects OFFSET for API-key queries, so page by timestamp (inclusive) and dedupe events by uuid
const buildReportsQuery = (fromTimestamp: string | null) => `
  select uuid, properties.songId as songId, toString(person_id) as personId,
    JSONExtract(ifNull(properties.issues, '[]'), 'Array(String)') as issues,
    timestamp, properties.songLastUpdated as songLastUpdated,
    toString(properties.instrumental) = 'true' as instrumental, properties.videoId as videoId
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

const toTime = (date: string | null | undefined) => (date ? new Date(date).getTime() : NaN);

// Versions that aren't dates fall back to the event time - the same rule applies to reports and player starts
const VERSION_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}/;
const toVersionTime = (date: string | null) => (date && VERSION_DATE_PATTERN.test(date) ? toTime(date) : NaN);

interface PlayersCutoff {
  /** Count only starts after this time (last update or dismissal), ms */
  since: number;
  /** Count only starts of this version or newer, ms */
  version: number;
}

// PostHog returns 100 rows unless the query sets a LIMIT, so query in batches well under the limit
const PLAYERS_BATCH_SIZE = 200;

// Distinct players of each flag key (song + video) since its cutoff and of its current version, so both sides of the
// share match
const buildPlayersQuery = (cutoffs: [flagKey: string, cutoff: PlayersCutoff][]) => {
  const ids = `[${cutoffs.map(([id]) => `'${id.replaceAll("'", "\\'")}'`).join(', ')}]`;
  const since = `[${cutoffs.map(([, cutoff]) => cutoff.since).join(', ')}]`;
  const versions = `[${cutoffs.map(([, cutoff]) => Math.floor(cutoff.version / 1000)).join(', ')}]`;

  return `
    select ${flagKeySql} as flagKey, uniq(person_id) as players
    from events
    where event = 'songStarted'
      and timestamp > now() - interval ${LOOKBACK_MONTHS} month
      and flagKey in ${ids}
      and timestamp > fromUnixTimestamp64Milli(toInt64(transform(flagKey, ${ids}, ${since}, 0)))
      and (not match(ifNull(toString(properties.songLastUpdated), ''), '${VERSION_DATE_PATTERN.source.replaceAll('\\', '\\\\')}')
        or toUnixTimestamp(parseDateTimeBestEffort(toString(properties.songLastUpdated)))
          >= toInt64(transform(flagKey, ${ids}, ${versions}, 0)))
    group by flagKey
    limit ${PLAYERS_BATCH_SIZE * 2}
  `;
};

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
  // flag key -> issue -> distinct reporters
  const reporters = new Map<string, Map<SongQualityIssue, Set<string>>>();
  const flagTargets = new Map<string, { songId: string; version: SongVersion }>();
  let skippedOutdated = 0;
  let skippedUnknownSong = 0;
  let skippedDismissed = 0;

  for (const [, songId, personId, issues, timestamp, songLastUpdated, instrumental, videoId] of events) {
    const song = songsById.get(songId);
    const version: SongVersion = instrumental ? 'instrumental' : 'original';
    const currentVideo = instrumental ? song?.instrumental?.video : song?.video;
    if (!song || !currentVideo) {
      skippedUnknownSong += 1;
      continue;
    }
    // Reported on a video the song no longer uses
    if (videoId && videoId !== currentVideo) {
      skippedOutdated += 1;
      continue;
    }
    const flagKey = getSongVersionKey(songId, version);
    // An admin already reviewed these reports
    const dismissedAt = dismissals[flagKey];
    if (dismissedAt && toTime(timestamp) <= dismissedAt) {
      skippedDismissed += 1;
      continue;
    }
    // Skip reports about an older version: use the version the player rated when known, else the report time
    const currentVersion = toTime(song.lastUpdate);
    const reportedVersion = Number.isNaN(toVersionTime(songLastUpdated))
      ? toTime(timestamp)
      : toVersionTime(songLastUpdated);
    if (!Number.isNaN(currentVersion) && reportedVersion < currentVersion) {
      skippedOutdated += 1;
      continue;
    }

    const songReporters = reporters.get(flagKey) ?? new Map<SongQualityIssue, Set<string>>();
    for (const issue of SONG_QUALITY_ISSUES.filter((issue) => issues.includes(issue))) {
      songReporters.set(issue, (songReporters.get(issue) ?? new Set()).add(personId));
    }
    reporters.set(flagKey, songReporters);
    flagTargets.set(flagKey, { songId, version });
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
  const cutoffs = candidates.map(([flagKey]): [string, PlayersCutoff] => {
    const version = toTime(songsById.get(flagTargets.get(flagKey)!.songId)?.lastUpdate) || 0;
    return [flagKey, { version, since: Math.max(version, dismissals[flagKey] ?? 0) }];
  });
  // Songs missing from a batch had no matching starts - the LIMIT is above the batch size, so nothing is cut off
  const players = new Map<string, number>();
  for (let index = 0; index < cutoffs.length; index += PLAYERS_BATCH_SIZE) {
    const batch = cutoffs.slice(index, index + PLAYERS_BATCH_SIZE);
    for (const [flagKey, count] of await runQuery<[flagKey: string, players: number]>(buildPlayersQuery(batch))) {
      players.set(flagKey, count);
    }
  }

  const flags: SongQualityFlag[] = candidates.flatMap(([flagKey, issueReporters]) => {
    const { songId, version } = flagTargets.get(flagKey)!;
    const song = songsById.get(songId)!;
    // Every reporter played the song, so one denominator covering all of them is used for every issue
    const songPlayers = Math.max(
      players.get(flagKey) ?? 0,
      ...[...issueReporters.values()].map((people) => people.size),
    );
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
        ...(version === 'instrumental' ? { version } : {}),
        artist: song.artist,
        title: song.title,
        language: song.language,
        videoId: (version === 'instrumental' ? song.instrumental?.video : song.video) ?? '',
        issues,
        reportCounts,
        players: songPlayers,
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
