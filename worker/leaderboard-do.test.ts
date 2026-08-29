import { reset, runInDurableObject } from 'cloudflare:test';
import { env as workerEnv } from 'cloudflare:workers';
import { afterEach, describe, expect, it } from 'vitest';

import { BOARD_KV_KEY, BoardResponse, LeaderboardSubmission } from '../src/modules/leaderboard/types';
import type { LeaderboardBoard } from './leaderboard-do';
import { BOARD_SIZE, RETENTION_MS } from './leaderboard-do';

const notesBlob = new Uint8Array([1, 2, 3, 4]);

const getBoard = () => {
  const namespace = workerEnv.LEADERBOARD_BOARD as DurableObjectNamespace<LeaderboardBoard>;

  return namespace.get(namespace.idFromName('board'));
};

const generateSubmission = (overrides: Partial<LeaderboardSubmission> = {}): LeaderboardSubmission => ({
  clientId: 'client-1',
  songId: 'song-1',
  artist: 'Artist',
  title: 'Title',
  songLastUpdate: '2026-01-01',
  score: 1_500_000,
  tolerance: 2,
  mode: 'PASS_THE_MIC',
  trackIndex: 0,
  inputLag: 100,
  name: 'Player',
  country: 'pl',
  notesHash: 'hash',
  notes: notesBlob,
  ...overrides,
});

afterEach(async () => {
  await reset();
});

describe('LeaderboardBoard', () => {
  it('stores a submission and projects it onto the board', async () => {
    const board = getBoard();

    const result = await board.submit(generateSubmission(), notesBlob);

    expect(result).toEqual({ accepted: true });
    expect((await board.projection()).entries).toEqual([
      expect.objectContaining({ name: 'Player', country: 'pl', score: 1_500_000, songId: 'song-1' }),
    ]);
  });

  it('never exposes the client id or the row id on the public board', async () => {
    const board = getBoard();
    await board.submit(generateSubmission(), notesBlob);

    const [entry] = (await board.projection()).entries;

    expect(entry).not.toHaveProperty('clientId');
    expect(entry).not.toHaveProperty('id');
  });

  it('keeps a row sung on Easy off the board, admin listing aside', async () => {
    const board = getBoard();

    await board.submit(generateSubmission({ clientId: 'client-easy', tolerance: 3, score: 3_000_000 }), notesBlob);
    await board.submit(generateSubmission({ clientId: 'client-medium' }), notesBlob);

    expect((await board.projection()).entries).toEqual([expect.objectContaining({ score: 1_500_000, tolerance: 2 })]);
    expect(await board.listForAdmin()).toHaveLength(2);
  });

  it('rebuilds the projection over the stored rows on demand', async () => {
    const board = getBoard();
    await board.submit(generateSubmission(), notesBlob);

    // The write path already rebuilt it; the point is that asking again is safe and reports the board
    expect(await board.rebuild()).toEqual({ entries: 1 });
    expect(JSON.parse((await workerEnv.LEADERBOARD_KV!.get(BOARD_KV_KEY))!).entries).toHaveLength(1);
  });

  it('keeps the higher score for a repeated client, song and name', async () => {
    const board = getBoard();

    await board.submit(generateSubmission({ score: 2_000_000 }), notesBlob);
    const lower = await board.submit(generateSubmission({ score: 1_200_000 }), notesBlob);
    const higher = await board.submit(generateSubmission({ score: 3_000_000 }), notesBlob);

    expect(lower).toEqual({ accepted: false, reason: 'lower-score' });
    expect(higher).toEqual({ accepted: true });
    expect((await board.projection()).entries).toEqual([expect.objectContaining({ score: 3_000_000 })]);
  });

  it('treats names differing only by case or whitespace as the same row', async () => {
    const board = getBoard();

    await board.submit(generateSubmission({ name: 'Player One', score: 1_100_000 }), notesBlob);
    await board.submit(generateSubmission({ name: '  player   one ', score: 2_100_000 }), notesBlob);

    const { entries } = await board.projection();
    expect(entries).toHaveLength(1);
    // Only the dedupe key is collapsed — the displayed name keeps the player's own spacing
    expect(entries[0]).toMatchObject({ name: 'player   one', score: 2_100_000 });
  });

  it('gives distinct names their own rows', async () => {
    const board = getBoard();

    await board.submit(generateSubmission({ name: 'Ann', score: 2_000_000 }), notesBlob);
    await board.submit(generateSubmission({ name: 'Bob', score: 1_000_000 }), notesBlob);

    expect((await board.projection()).entries.map((entry) => entry.name)).toEqual(['Ann', 'Bob']);
  });

  it('writes the projection to KV on every accepted write', async () => {
    const board = getBoard();
    await board.submit(generateSubmission({ score: 2_500_000 }), notesBlob);

    const stored = await workerEnv.LEADERBOARD_KV.get<BoardResponse>(BOARD_KV_KEY, 'json');

    expect(stored?.entries).toEqual([expect.objectContaining({ score: 2_500_000 })]);
  });

  it('lists rows with ids for admin and rebuilds the board on delete', async () => {
    const board = getBoard();
    await board.submit(generateSubmission({ name: 'Ann', score: 2_000_000 }), notesBlob);
    await board.submit(generateSubmission({ name: 'Bob', score: 1_000_000 }), notesBlob);

    const rows = await board.listForAdmin();
    const ann = rows.find((row) => row.name === 'Ann')!;

    expect(ann.id).toEqual(expect.any(String));
    expect(await board.deleteRow(ann.id)).toBe(true);
    expect(await board.deleteRow('missing-id')).toBe(false);
    expect((await board.projection()).entries.map((entry) => entry.name)).toEqual(['Bob']);
  });

  it('drops expired rows and backfills the board from previously unranked records', async () => {
    const board = getBoard();

    // Fill the board, then add one more record that is too low to be ranked
    for (let index = 0; index < BOARD_SIZE; index++) {
      await board.submit(generateSubmission({ clientId: `client-${index}`, score: 2_000_000 + index }), notesBlob);
    }
    await board.submit(generateSubmission({ clientId: 'newcomer', name: 'Newcomer', score: 1_000_001 }), notesBlob);

    expect((await board.projection()).entries).toHaveLength(BOARD_SIZE);
    expect((await board.projection()).entries.map((entry) => entry.name)).not.toContain('Newcomer');

    // Age everything except the newcomer past the retention window
    await runInDurableObject(board, (_instance, state) => {
      state.storage.sql.exec(
        `UPDATE records SET created_at = ? WHERE name != ?`,
        Date.now() - RETENTION_MS - 1000,
        'Newcomer',
      );
    });

    await runInDurableObject(board, (instance) => instance.alarm());

    const { entries } = await board.projection();
    expect(entries.map((entry) => entry.name)).toEqual(['Newcomer']);
  });

  it('deletes the notes blobs of expired records', async () => {
    const board = getBoard();
    await board.submit(generateSubmission(), notesBlob);

    await runInDurableObject(board, (_instance, state) => {
      state.storage.sql.exec(`UPDATE records SET created_at = ?`, Date.now() - RETENTION_MS - 1000);
    });
    await runInDurableObject(board, (instance) => instance.alarm());

    const remainingNotes = await runInDurableObject(
      board,
      (_instance, state) =>
        state.storage.sql.exec<{ count: number }>(`SELECT COUNT(*) AS count FROM notes`).one().count,
    );

    expect(remainingNotes).toBe(0);
  });

  it('rejects submissions with an empty name', async () => {
    const board = getBoard();

    expect(await board.submit(generateSubmission({ name: '   ' }), notesBlob)).toEqual({
      accepted: false,
      reason: 'invalid',
    });
  });
});
