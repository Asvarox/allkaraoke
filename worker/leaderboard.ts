import { unpack } from 'msgpackr';

// Relative imports on purpose: the `~` alias is only configured for the app build
import {
  MAX_NOTES_RECORDS,
  MAX_POINTS,
  MAX_SUBMISSION_BYTES,
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

const jsonHeaders = { 'Content-Type': 'application/json' };

const error = (status: number, message: string) =>
  new Response(JSON.stringify({ error: message }), { status, headers: jsonHeaders });

export const getBoardStub = (env: LeaderboardEnv) => {
  const namespace = env.LEADERBOARD_BOARD;
  if (!namespace) return null;

  return namespace.get(namespace.idFromName(BOARD_INSTANCE_NAME));
};

const isNonEmptyString = (value: unknown): value is string => typeof value === 'string' && value.trim().length > 0;

/**
 * Shape and bounds checks on a decoded submission. Everything here is cheap and synchronous; the
 * hash recomputation is done separately because it is not.
 */
const validateSubmission = (payload: unknown): { submission: LeaderboardSubmission } | { message: string } => {
  if (!payload || typeof payload !== 'object') return { message: 'Invalid payload' };

  const submission = payload as Partial<LeaderboardSubmission>;

  if (
    !isNonEmptyString(submission.clientId) ||
    !isNonEmptyString(submission.songId) ||
    !isNonEmptyString(submission.name) ||
    !isNonEmptyString(submission.artist) ||
    !isNonEmptyString(submission.title) ||
    !isNonEmptyString(submission.mode) ||
    !isNonEmptyString(submission.notesHash) ||
    typeof submission.tolerance !== 'number' ||
    typeof submission.trackIndex !== 'number' ||
    typeof submission.inputLag !== 'number'
  ) {
    return { message: 'Invalid payload' };
  }

  if (submission.country !== null && typeof submission.country !== 'string') {
    return { message: 'Invalid country' };
  }

  if (!Number.isInteger(submission.score)) return { message: 'Invalid score' };
  if (submission.score! < QUALIFYING_SCORE || submission.score! > MAX_POINTS) {
    return { message: 'Score out of range' };
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

  return { submission: submission as LeaderboardSubmission };
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
    await caches.default.delete(new URL('/leaderboard', request.url).toString());
  }

  return new Response(JSON.stringify(result), { headers: jsonHeaders });
};

export const handleLeaderboardRead = async (request: Request, env: LeaderboardEnv) => {
  if (request.method !== 'GET') return error(405, 'Method not allowed');

  const cache = caches.default;
  const cached = await cache.match(request);
  if (cached) return cached;

  const stored = (await env.LEADERBOARD_KV?.get(BOARD_KV_KEY)) ?? JSON.stringify(EMPTY_BOARD);

  const headers = {
    ...jsonHeaders,
    'Cache-Control': 'public, max-age=60, stale-while-revalidate=600',
  };

  // Two independent responses over the same string rather than a `clone()`: awaiting a put on a
  // tee'd body can block until the other branch is drained, and nothing drains the one we return.
  await cache.put(request, new Response(stored, { headers }));

  return new Response(stored, { headers });
};
