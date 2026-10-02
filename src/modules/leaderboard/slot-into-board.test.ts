import { slotIntoBoard } from '~/modules/leaderboard/slot-into-board';
import { BoardEntry, SongBoardResponse } from '~/modules/leaderboard/types';

const entry = (name: string, score: number): BoardEntry => ({
  name,
  country: null,
  score,
  artist: 'Artist',
  title: 'Title',
  songId: 'song',
  tolerance: 2,
  createdAt: 0,
});

const board = (entries: BoardEntry[], position: number | null, startPosition = 1): SongBoardResponse => ({
  entries,
  total: entries.length,
  startPosition,
  position,
});

const names = (rows: ReturnType<typeof slotIntoBoard>['rows']) =>
  rows.map(({ entry, isPlayer }) => (isPlayer ? `*${entry.name}` : entry.name));

describe('slotIntoBoard', () => {
  const listed = [entry('Ann', 3000), entry('Bob', 2000), entry('Cid', 1000)];

  it('lists the board as is without a run', () => {
    expect(slotIntoBoard(board(listed, null), null)).toEqual({
      rows: listed.map((listedEntry) => ({ entry: listedEntry, isPlayer: false })),
      position: null,
    });
  });

  it('slots a run in at the rank the board gave it', () => {
    const slotted = slotIntoBoard(board(listed, 2), entry('Me', 2500));

    expect(names(slotted.rows)).toEqual(['Ann', '*Me', 'Bob', 'Cid']);
    expect(slotted.position).toBe(2);
  });

  it('counts the rank from the start of the window', () => {
    const slotted = slotIntoBoard(board(listed, 42, 40), entry('Me', 1500));

    expect(names(slotted.rows)).toEqual(['Ann', 'Bob', '*Me', 'Cid']);
    expect(slotted.position).toBe(42);
  });

  it('marks a run already on the board instead of listing it twice', () => {
    // The board ranks a score it already holds one place below where it sits
    const slotted = slotIntoBoard(board(listed, 3), entry('  bob ', 2000.4));

    expect(names(slotted.rows)).toEqual(['Ann', '*Bob', 'Cid']);
    expect(slotted.position).toBe(2);
  });

  it('keeps somebody else with the same score apart from the run', () => {
    const slotted = slotIntoBoard(board(listed, 3), entry('Me', 2000));

    expect(names(slotted.rows)).toEqual(['Ann', 'Bob', '*Me', 'Cid']);
  });
});
