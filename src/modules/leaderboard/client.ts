import { pack } from 'msgpackr';

import { getClientId } from '~/modules/leaderboard/identity';
import { computeNotesHash } from '~/modules/leaderboard/notes-hash';
import { BoardResponse, LeaderboardSubmission } from '~/modules/leaderboard/types';

export const LEADERBOARD_URL = '/leaderboard';

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
