import posthog from 'posthog-js';

import { MAX_POINTS } from '~/consts';
import { SongPreview } from '~/interfaces';
import { submitScore, SubmitScoreInput } from '~/modules/leaderboard/client';
import {
  BACKFILL_ACCEPTED_UNTIL,
  BACKFILL_WINDOW_MS,
  MAX_SUBMITTED_SCORE,
  MAX_SUBMITTED_TOLERANCE,
} from '~/modules/leaderboard/consts';
import { LeaderboardCountrySetting, LeaderboardNameSetting } from '~/modules/leaderboard/identity';
import { LeaderboardSharingSetting } from '~/modules/leaderboard/sharing';
import SongsService from '~/modules/songs/songs-service';
import { getAllStats, getSongKey, SongStats } from '~/modules/songs/stats/common';
import { fixStoredMergedTrackScores } from '~/modules/songs/stats/merged-track-score-fix';
import { FeatureFlags } from '~/modules/utils/feature-flags';
import { Setting } from '~/routes/settings/settings-state';

/**
 * Once every candidate went through. A failed run (rate limit, offline, the flag switched off
 * mid-way) leaves it unset, and the next app start tries again.
 */
const BackfillDoneSetting = new Setting<boolean>('leaderboard-backfill-done', false);

/** The Worker lets 2 submissions per minute through for one client. */
const SUBMIT_INTERVAL_MS = 31_000;

type BackfillCandidate = Pick<
  SubmitScoreInput,
  'songId' | 'artist' | 'title' | 'songLastUpdate' | 'score' | 'tolerance' | 'mode'
> & { playedAt: number };

/**
 * The best run per song and difficulty that the Worker refused before MAX_SUBMITTED_SCORE existed.
 * The board keeps one row per (client, song, name, difficulty) — a second would only lose to the first.
 */
export function collectBackfillCandidates(
  stats: Record<string, SongStats>,
  songs: SongPreview[],
  now: number,
): BackfillCandidate[] {
  const songsByKey = new Map(songs.map((song) => [getSongKey(song), song]));
  const best = new Map<string, BackfillCandidate>();

  for (const [key, songStats] of Object.entries(stats)) {
    const song = songsByKey.get(key);
    if (!song) continue;

    for (const entry of songStats?.scores ?? []) {
      const playedAt = new Date(entry.date).getTime();
      const { tolerance, mode } = entry.setup;
      if (!(playedAt >= now - BACKFILL_WINDOW_MS && playedAt <= now)) continue;
      if (tolerance < 1 || tolerance > MAX_SUBMITTED_TOLERANCE) continue;

      for (const { score: rawScore } of entry.scores) {
        const score = Math.round(rawScore);
        if (score <= MAX_POINTS || score > MAX_SUBMITTED_SCORE) continue;
        const candidateKey = `${song.id}:${tolerance}`;
        if ((best.get(candidateKey)?.score ?? 0) >= score) continue;

        best.set(candidateKey, {
          songId: song.id,
          artist: song.artist,
          title: song.title,
          songLastUpdate: song.lastUpdate ?? null,
          score,
          tolerance,
          mode,
          playedAt,
        });
      }
    }
  }

  return [...best.values()];
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const isEnabled = () => posthog.isFeatureEnabled(FeatureFlags.LeaderboardBackfill) === true;

/**
 * Only for players who share every qualifying score anyway, under the identity they shared with —
 * the local entry's player name is a slot name, not a board identity.
 */
async function runBackfill() {
  const name = LeaderboardNameSetting.get();
  if (BackfillDoneSetting.get() || LeaderboardSharingSetting.get() !== 'always' || !name) return;
  if (Date.now() >= BACKFILL_ACCEPTED_UNTIL) return;

  // Every run above MAX_POINTS is a merged-track score from before the fix; once fixed, none are left to send
  await fixStoredMergedTrackScores();

  const [stats, songs] = await Promise.all([getAllStats(), SongsService.getIndex()]);
  const candidates = collectBackfillCandidates(stats, songs, Date.now());

  for (const [index, candidate] of candidates.entries()) {
    if (index > 0) await wait(SUBMIT_INTERVAL_MS);
    if (!isEnabled()) return;

    const response = await submitScore({
      ...candidate,
      trackIndex: 0,
      inputLag: 0,
      name,
      country: LeaderboardCountrySetting.get(),
      notes: new Uint8Array(0),
    });

    // A 4xx other than the rate limit will not change on a retry; anything else might
    if (!response || response.status === 429 || response.status >= 500) return;
  }

  BackfillDoneSetting.set(true);
  if (candidates.length) posthog.capture('leaderboardBackfilled', { count: candidates.length });
}

let started = false;

/** PostHog is never initialised in e2e and prerendering, so this never fires there. */
posthog.onFeatureFlags(() => {
  if (started || !isEnabled()) return;
  started = true;

  runBackfill().catch((error: unknown) => console.error('Leaderboard backfill failed', error));
});
