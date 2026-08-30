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
 * Pitch tolerance on a sing setup: 1 = Hard, 2 = Medium, 3 = Easy, 4+ the dev-only debug widths.
 *
 * Two different limits hang off it, because the two boards rank different things:
 *
 * - {@link MAX_SUBMITTED_TOLERANCE} — the easiest run that may be stored at all. The per-song boards
 *   are split by difficulty, so an Easy run is only ever ranked against other Easy runs of the same
 *   song and there is nothing incomparable about it. The debug widths above Easy are not a shipped
 *   difficulty and get no board.
 * - {@link MAX_GLOBAL_BOARD_TOLERANCE} — the easiest run that reaches the single global board on the
 *   main menu. That board mixes every song and every difficulty into one ranking, and each step
 *   widens the pitch window the scoring uses, so an Easy run reaches the qualifying score for
 *   singing that would not come close on Medium. Those rows would not be comparable.
 */
export const MAX_SUBMITTED_TOLERANCE = 3;

export const MAX_GLOBAL_BOARD_TOLERANCE = 2;

/**
 * How many rows `GET /leaderboard-song` returns. Smaller than the global board: this one sits beside
 * the local high scores on the post-game screen, and `total` carries the rest of the story.
 */
export const SONG_BOARD_SIZE = 20;

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
