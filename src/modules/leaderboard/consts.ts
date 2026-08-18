// Relative import on purpose: this module is reachable from the Worker bundle, where the `~` alias
// is not configured.
import { MAX_POINTS } from '../../consts';

/**
 * A score qualifies for the leaderboard prompt at 1,000,000 — expressed as a share of MAX_POINTS so
 * it cannot drift if the scoring formula's ceiling ever changes.
 */
export const QUALIFYING_SCORE_RATIO = 2 / 7;

export const QUALIFYING_SCORE = MAX_POINTS * QUALIFYING_SCORE_RATIO;

/** Request body cap for `POST /leaderboard`. */
export const MAX_SUBMISSION_BYTES = 256 * 1024;

/**
 * Plausibility bounds on the number of frequency records in a submission. The Worker has no song
 * duration to check against, so these only rule out an empty or absurd blob.
 */
export const MIN_NOTES_RECORDS = 100;
export const MAX_NOTES_RECORDS = 200_000;

export { MAX_POINTS };
