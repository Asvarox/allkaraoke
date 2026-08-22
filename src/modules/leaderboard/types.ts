/**
 * Shapes shared between the client and the Worker. This file must stay dependency-free — the
 * Worker imports it and anything pulled in here ends up in the Worker bundle.
 */

/** Body of `POST /leaderboard`, msgpack-packed. */
export interface LeaderboardSubmission {
  clientId: string;
  songId: string;
  artist: string;
  title: string;
  songLastUpdate: string | null;
  score: number;
  tolerance: number;
  mode: string;
  trackIndex: number;
  inputLag: number;
  name: string;
  /** ISO-3166 alpha-2, `null` when the player preferred not to say. */
  country: string | null;
  /** sha-256 hex over the packed notes bytes concatenated with the score. */
  notesHash: string;
  notes: Uint8Array;
}

/** One public row of the board. Carries no `clientId` and no row id — the response is world-readable. */
export interface BoardEntry {
  name: string;
  country: string | null;
  score: number;
  artist: string;
  title: string;
  songId: string;
  tolerance: number;
  /** epoch ms; the client renders the relative date so a cached response cannot go stale */
  createdAt: number;
}

/** Body of `GET /leaderboard`. */
export interface BoardResponse {
  generatedAt: number;
  entries: BoardEntry[];
}

/** Board row as returned by the authenticated admin listing, with the id needed to delete it. */
export interface AdminBoardEntry extends BoardEntry {
  id: string;
}

export const BOARD_KV_KEY = 'board:v1';
