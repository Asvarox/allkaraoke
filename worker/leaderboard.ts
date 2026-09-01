import { unpack } from 'msgpackr';

// Relative imports on purpose: the `~` alias is only configured for the app build
import {
  MAX_NOTES_RECORDS,
  MAX_POINTS,
  MAX_SUBMITTED_TOLERANCE,
  MAX_SUBMISSION_BYTES,
  MAX_SUBMITTED_ID_LENGTH,
  MAX_SUBMITTED_NAME_LENGTH,
  MAX_SUBMITTED_SONG_TEXT_LENGTH,
  MIN_NOTES_RECORDS,
  QUALIFYING_SCORE,
} from '../src/modules/leaderboard/consts';
import { computeNotesHash } from '../src/modules/leaderboard/notes-hash';
import { decodeNotesPayload } from '../src/modules/leaderboard/notes-payload';
import { BOARD_KV_KEY, BoardResponse, LeaderboardSubmission } from '../src/modules/leaderboard/types';
import type { LeaderboardBoard } from './leaderboard-do';

export interface LeaderboardEnv {
  LEADERBOARD_KV?: KVNamespace;
  LEADERBOARD_BOARD?: DurableObjectNamespace<LeaderboardBoard>;
  LEADERBOARD_RATE_LIMITER?: { limit: (options: { key: string }) => Promise<{ success: boolean }> };
}

/** Single global board — every submission and every read goes through one Durable Object. */
const BOARD_INSTANCE_NAME = 'board';

const EMPTY_BOARD: BoardResponse = { generatedAt: 0, entries: [] };

/**
 * One cache entry for the board, whatever query string the caller used. Keying on the raw request
 * would let `/leaderboard?x=1` occupy its own entry that no purge ever reaches — and bypass the
 * cache into KV on every distinct string.
 */
export const boardCacheKey = (request: Request) => new URL('/leaderboard', request.url).toString();

const jsonHeaders = { 'Content-Type': 'application/json' };

const error = (status: number, message: string) =>
  new Response(JSON.stringify({ error: message }), { status, headers: jsonHeaders });

export const getBoardStub = (env: LeaderboardEnv) => {
  const namespace = env.LEADERBOARD_BOARD;
  if (!namespace) return null;

  return namespace.get(namespace.idFromName(BOARD_INSTANCE_NAME));
};

const isNonEmptyString = (value: unknown): value is string => typeof value === 'string' && value.trim().length > 0;

const isBoundedString = (value: unknown, maxLength: number): value is string =>
  isNonEmptyString(value) && value.length <= maxLength;

/** ISO-3166 alpha-2, which is all the client ever sends. */
const isCountryCode = (value: unknown) => typeof value === 'string' && /^[a-z]{2}$/.test(value);

/**
 * Shape and bounds checks on a decoded submission. Everything here is cheap and synchronous; the
 * hash recomputation is done separately because it is not.
 */
const validateSubmission = (payload: unknown): { submission: LeaderboardSubmission } | { message: string } => {
  if (!payload || typeof payload !== 'object') return { message: 'Invalid payload' };

  const submission = payload as Partial<LeaderboardSubmission>;

  if (
    !isBoundedString(submission.clientId, MAX_SUBMITTED_ID_LENGTH) ||
    !isBoundedString(submission.songId, MAX_SUBMITTED_ID_LENGTH) ||
    !isBoundedString(submission.name, MAX_SUBMITTED_NAME_LENGTH) ||
    !isBoundedString(submission.artist, MAX_SUBMITTED_SONG_TEXT_LENGTH) ||
    !isBoundedString(submission.title, MAX_SUBMITTED_SONG_TEXT_LENGTH) ||
    !isBoundedString(submission.mode, MAX_SUBMITTED_ID_LENGTH) ||
    !isBoundedString(submission.notesHash, MAX_SUBMITTED_ID_LENGTH) ||
    !Number.isFinite(submission.tolerance) ||
    !Number.isFinite(submission.trackIndex) ||
    !Number.isFinite(submission.inputLag)
  ) {
    return { message: 'Invalid payload' };
  }

  if (submission.country !== null && !isCountryCode(submission.country)) {
    return { message: 'Invalid country' };
  }

  // msgpack can carry a map or an array here, and the Durable Object binds it straight into a TEXT
  // column — an unbindable type would throw inside `submit` and surface as a 500 rather than a 400
  if (
    submission.songLastUpdate !== null &&
    submission.songLastUpdate !== undefined &&
    !isBoundedString(submission.songLastUpdate, MAX_SUBMITTED_SONG_TEXT_LENGTH)
  ) {
    return { message: 'Invalid songLastUpdate' };
  }

  if (!Number.isInteger(submission.score)) return { message: 'Invalid score' };
  if (submission.score! < QUALIFYING_SCORE || submission.score! > MAX_POINTS) {
    return { message: 'Score out of range' };
  }

  // Easy is stored — it gets its own per-song board, where it is only ever ranked against other
  // Easy runs. What it does not get is a place on the global board, and that is the projection's
  // job (see `MAX_GLOBAL_BOARD_TOLERANCE`), not this one. Above Easy are the dev-only debug widths,
  // which are not a shipped difficulty and get no board at all. Checked here too because the client
  // is not the authority on what reaches a public board.
  if (
    !Number.isInteger(submission.tolerance) ||
    submission.tolerance! < 1 ||
    submission.tolerance! > MAX_SUBMITTED_TOLERANCE
  ) {
    return { message: 'Difficulty not eligible' };
  }

  if (!(submission.notes instanceof Uint8Array) || submission.notes.byteLength === 0) {
    return { message: 'Missing notes' };
  }

  let recordCount: number;
  try {
    recordCount = decodeNotesPayload(submission.notes).length;
  } catch {
    return { message: 'Malformed notes' };
  }

  if (recordCount < MIN_NOTES_RECORDS || recordCount > MAX_NOTES_RECORDS) {
    return { message: 'Implausible notes' };
  }

  return { submission: { ...submission, songLastUpdate: submission.songLastUpdate ?? null } as LeaderboardSubmission };
};

export const handleLeaderboardSubmit = async (request: Request, env: LeaderboardEnv) => {
  if (request.method !== 'POST') return error(405, 'Method not allowed');

  const board = getBoardStub(env);
  if (!board) return error(500, 'Leaderboard storage is not configured');

  const body = new Uint8Array(await request.arrayBuffer());
  if (body.byteLength > MAX_SUBMISSION_BYTES) return error(413, 'Payload too large');

  let decoded: unknown;
  try {
    decoded = unpack(body as Uint8Array<ArrayBuffer>);
  } catch {
    return error(400, 'Malformed body');
  }

  const validated = validateSubmission(decoded);
  if ('message' in validated) return error(400, validated.message);

  const { submission } = validated;

  const expectedHash = await computeNotesHash(submission.notes, submission.score);
  if (expectedHash !== submission.notesHash) return error(400, 'Notes hash mismatch');

  const rateLimit = await env.LEADERBOARD_RATE_LIMITER?.limit({ key: submission.clientId });
  if (rateLimit && !rateLimit.success) return error(429, 'Too many requests');

  const result = await board.submit(submission, submission.notes);

  if (result.accepted) {
    // Drops this colo's cached board so the submitting player sees their own row immediately
    // instead of waiting out the 60s max-age. Other colos still serve their cached copy.
    // Awaited rather than deferred: it is colo-local and cheap, and leaving cache work running
    // past the response makes it race the teardown in the Workers-pool tests.
    await caches.default.delete(boardCacheKey(request));
  }

  return new Response(JSON.stringify(result), { headers: jsonHeaders });
};

/**
 * The board for one song at one difficulty, and the rank the caller's score would take on it.
 *
 * Unlike the global board this one ranks Easy too — a board split by difficulty has nothing to gain
 * from refusing the easy end of it.
 *
 * Served from the Durable Object rather than the KV projection and the Cache API that back
 * `GET /leaderboard`: there is one of these per (song, difficulty) rather than one in total, and the
 * `score` parameter differs on nearly every call, so an edge cache would miss more or less always.
 * The read happens once per finished song, which is orders of magnitude below main-menu loads.
 */
export const handleSongLeaderboardRead = async (request: Request, env: LeaderboardEnv) => {
  if (request.method !== 'GET') return error(405, 'Method not allowed');

  const board = getBoardStub(env);
  if (!board) return error(500, 'Leaderboard storage is not configured');

  const params = new URL(request.url).searchParams;

  const songId = params.get('songId');
  if (!isBoundedString(songId, MAX_SUBMITTED_ID_LENGTH)) return error(400, 'Invalid songId');

  const tolerance = Number(params.get('tolerance'));
  // Every shipped difficulty has a board of its own, Easy included; the debug widths above it are
  // never stored, so a request for one could only ever describe an empty board
  if (!Number.isInteger(tolerance) || tolerance < 1 || tolerance > MAX_SUBMITTED_TOLERANCE) {
    return error(400, 'Invalid tolerance');
  }

  const rawScore = params.get('score');
  const score = rawScore === null ? null : Math.round(Number(rawScore));
  if (score !== null && (!Number.isFinite(score) || score < 0 || score > MAX_POINTS)) {
    return error(400, 'Invalid score');
  }

  const result = await board.songBoard(songId, tolerance, score);

  return new Response(JSON.stringify(result), {
    // Private and short: the response is keyed on a score that belongs to one player, so it is only
    // ever reusable by the tab that asked for it
    headers: { ...jsonHeaders, 'Cache-Control': 'private, max-age=30' },
  });
};

export const handleLeaderboardRead = async (request: Request, env: LeaderboardEnv) => {
  if (request.method !== 'GET') return error(405, 'Method not allowed');

  const cache = caches.default;
  const cacheKey = boardCacheKey(request);

  const cached = await cache.match(cacheKey);
  if (cached) return cached;

  const stored = (await env.LEADERBOARD_KV?.get(BOARD_KV_KEY)) ?? JSON.stringify(EMPTY_BOARD);

  const headers = {
    ...jsonHeaders,
    'Cache-Control': 'public, max-age=60, stale-while-revalidate=600',
  };

  // Two independent responses over the same string rather than a `clone()`: awaiting a put on a
  // tee'd body can block until the other branch is drained, and nothing drains the one we return.
  await cache.put(cacheKey, new Response(stored, { headers }));

  return new Response(stored, { headers });
};
