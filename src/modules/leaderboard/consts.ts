// Relative import on purpose: this module is reachable from the Worker bundle, where the `~` alias
// is not configured.
import { MAX_POINTS } from '../../consts';

/**
 * A score qualifies for the leaderboard prompt at 1,000,000 — expressed as a share of MAX_POINTS so
 * it cannot drift if the scoring formula's ceiling ever changes.
 */
export const QUALIFYING_SCORE_RATIO = 2 / 7;

export const QUALIFYING_SCORE = MAX_POINTS * QUALIFYING_SCORE_RATIO;

/**
 * Widest pitch tolerance (a sing setup's `tolerance`) the board accepts: 1 = Hard, 2 = Medium,
 * 3 = Easy, 4+ the dev-only debug widths. Only Medium and harder count — every step widens the
 * pitch window the scoring uses, so an Easy run reaches the qualifying score for singing that
 * would not come close on Medium, and the rows would not be comparable.
 */
export const MAX_QUALIFYING_TOLERANCE = 2;

/** Request body cap for `POST /leaderboard`. */
export const MAX_SUBMISSION_BYTES = 256 * 1024;

/**
 * Plausibility bounds on the number of frequency records in a submission. The Worker has no song
 * duration to check against, so these only rule out an empty or absurd blob.
 */
export const MIN_NOTES_RECORDS = 100;
export const MAX_NOTES_RECORDS = 200_000;

/**
 * Per-field caps on the text that reaches the public board. The body cap alone is no protection:
 * it leaves room for a ~200 KB name, and every accepted row is denormalized into the single KV
 * projection value, so a caller rotating `clientId` could inflate that document at will.
 */
export const MAX_SUBMITTED_NAME_LENGTH = 40;
export const MAX_SUBMITTED_SONG_TEXT_LENGTH = 200;
export const MAX_SUBMITTED_ID_LENGTH = 128;

export { MAX_POINTS };
