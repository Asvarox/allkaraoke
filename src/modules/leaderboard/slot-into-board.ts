import { BoardEntry, SongBoardResponse } from '~/modules/leaderboard/types';

export interface SlottedBoardRow {
  entry: BoardEntry;
  /** The player's own run — highlighted, and the row the list scrolls to. */
  isPlayer: boolean;
}

interface SlottedBoard {
  rows: SlottedBoardRow[];
  /** 1-based rank of the player's row, `null` when the board has none. */
  position: number | null;
}

/** Mirrors the Worker's dedupe key: names differing only by case or whitespace are one name. */
const normalizeName = (name: string) => name.trim().replace(/\s+/g, ' ').toLowerCase();

/** A window of a song board with the player's run slotted in at its rank. A run already on it (same
 * name and score, shared earlier) is marked in place instead, as the board ranks it one place too low. */
export function slotIntoBoard(board: SongBoardResponse, run: BoardEntry | null): SlottedBoard {
  const rows = board.entries.map((entry) => ({ entry, isPlayer: false }));
  if (!run || board.position === null) return { rows, position: null };

  const sharedIndex = rows.findIndex(
    ({ entry }) => entry.score === Math.round(run.score) && normalizeName(entry.name) === normalizeName(run.name),
  );
  if (sharedIndex !== -1) {
    rows[sharedIndex] = { ...rows[sharedIndex], isPlayer: true };
    return { rows, position: board.startPosition + sharedIndex };
  }

  // Ranks come out right either way: the rows above the insertion keep theirs, and the ones below are
  // pushed down by exactly the one row that joined them
  const index = Math.min(Math.max(board.position - board.startPosition, 0), rows.length);
  rows.splice(index, 0, { entry: run, isPlayer: true });

  return { rows, position: board.startPosition + index };
}
