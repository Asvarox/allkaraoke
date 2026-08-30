import { pack } from 'msgpackr';

import { getClientId } from '~/modules/leaderboard/identity';
import { computeNotesHash } from '~/modules/leaderboard/notes-hash';
import { BoardResponse, LeaderboardSubmission, SongBoardResponse } from '~/modules/leaderboard/types';

export const LEADERBOARD_URL = '/leaderboard';
const SONG_LEADERBOARD_URL = '/leaderboard-song';

export type SubmitScoreInput = Omit<LeaderboardSubmission, 'clientId' | 'notesHash'>;

/**
 * Fire-and-forget. Failures are swallowed on purpose — there is no retry queue and no error is
 * surfaced to the player; a vanity board does not earn one.
 */
export async function submitScore(input: SubmitScoreInput): Promise<void> {
  try {
    const score = Math.round(input.score);

    const submission: LeaderboardSubmission = {
      ...input,
      score,
      clientId: getClientId(),
      notesHash: await computeNotesHash(input.notes, score),
    };

    await fetch(LEADERBOARD_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/msgpack' },
      // msgpackr types the return as node's Buffer; in the browser it is a plain Uint8Array
      body: pack(submission) as unknown as Uint8Array<ArrayBuffer>,
    });
  } catch {
    // ignored on purpose
  }
}

export const fetchBoard = async (): Promise<BoardResponse> => {
  const response = await fetch(LEADERBOARD_URL);

  if (!response.ok) throw new Error(`Failed to load the leaderboard: ${response.status}`);

  return response.json();
};

interface SongBoardQuery {
  songId: string;
  tolerance: number;
  /** Ranked against the board without being on it — the response says where it would land. */
  score: number | null;
}

/**
 * The SWR key doubles as the request URL, so a different song, difficulty or score is a different
 * fetch on its own without a `useEffect` to invalidate anything.
 */
export const songBoardUrl = ({ songId, tolerance, score }: SongBoardQuery) => {
  const params = new URLSearchParams({ songId, tolerance: String(tolerance) });
  if (score !== null) params.set('score', String(Math.round(score)));

  return `${SONG_LEADERBOARD_URL}?${params.toString()}`;
};

export const fetchSongBoard = async (url: string): Promise<SongBoardResponse> => {
  const response = await fetch(url);

  if (!response.ok) throw new Error(`Failed to load the song leaderboard: ${response.status}`);

  return response.json();
};
