import { reset, SELF } from 'cloudflare:test';
import { env as workerEnv } from 'cloudflare:workers';
import { pack } from 'msgpackr';
import { afterEach, describe, expect, it } from 'vitest';

import { MAX_POINTS, QUALIFYING_SCORE } from '../src/modules/leaderboard/consts';
import { computeNotesHash } from '../src/modules/leaderboard/notes-hash';
import { encodeNotesPayload } from '../src/modules/leaderboard/notes-payload';
import { BoardResponse, LeaderboardSubmission, SongBoardResponse } from '../src/modules/leaderboard/types';
import { handleLeaderboardSubmit, LeaderboardEnv } from './leaderboard';

const generateNotes = (recordCount: number) =>
  encodeNotesPayload([
    {
      start: 0,
      length: 1,
      distance: 0,
      note: { start: 0, length: 1, type: 'normal', lyrics: 'a', pitch: 5 },
      isPerfect: false,
      vibrato: false,
      frequencyRecords: Array.from({ length: recordCount }, (_, index) => ({
        timestamp: index * 16,
        frequency: 200 + (index % 50),
        preciseDistance: 0,
      })),
    },
  ]);

const generateSubmission = async (
  overrides: Partial<LeaderboardSubmission> = {},
  notes = generateNotes(500),
): Promise<LeaderboardSubmission> => {
  const score = overrides.score ?? 1_500_000;

  return {
    clientId: 'client-1',
    songId: 'song-1',
    artist: 'Artist',
    title: 'Title',
    songLastUpdate: '2026-01-01',
    tolerance: 2,
    mode: 'PASS_THE_MIC',
    trackIndex: 0,
    inputLag: 100,
    name: 'Player',
    country: 'pl',
    notes,
    notesHash: await computeNotesHash(notes, score),
    ...overrides,
    score,
  };
};

const submit = (submission: unknown) =>
  SELF.fetch('https://example.com/leaderboard', { method: 'POST', body: pack(submission) });

afterEach(async () => {
  await reset();
});

describe('POST /leaderboard', () => {
  it('accepts a valid submission and puts it on the board', async () => {
    const response = await submit(await generateSubmission());

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ accepted: true });

    const board = await SELF.fetch('https://example.com/leaderboard');
    expect(((await board.json()) as BoardResponse).entries).toEqual([
      expect.objectContaining({ name: 'Player', score: 1_500_000 }),
    ]);
  });

  it('serves the board with a cacheable max-age', async () => {
    const response = await SELF.fetch('https://example.com/leaderboard');

    expect(response.headers.get('Cache-Control')).toBe('public, max-age=60, stale-while-revalidate=600');
    expect(await response.json()).toEqual({ generatedAt: 0, entries: [] });
  });

  it('serves a fresh board right after a submission instead of the cached empty one', async () => {
    const before = await SELF.fetch('https://example.com/leaderboard');
    expect(((await before.json()) as BoardResponse).entries).toHaveLength(0);

    await submit(await generateSubmission());

    const after = await SELF.fetch('https://example.com/leaderboard');
    expect(((await after.json()) as BoardResponse).entries).toHaveLength(1);
  });

  it('rejects a score below the qualifying threshold', async () => {
    const response = await submit(await generateSubmission({ score: QUALIFYING_SCORE - 1 }));

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: 'Score out of range' });
  });

  it('rejects a score above MAX_POINTS', async () => {
    const response = await submit(await generateSubmission({ score: MAX_POINTS + 1 }));

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: 'Score out of range' });
  });

  it('stores an Easy score for the song boards while keeping it off the global one', async () => {
    const response = await submit(await generateSubmission({ tolerance: 3, name: 'Easy singer' }));
    expect(response.status).toBe(200);

    const global = (await (await SELF.fetch('https://example.com/leaderboard')).json()) as BoardResponse;
    expect(global.entries).toEqual([]);

    const song = (await (
      await SELF.fetch('https://example.com/leaderboard-song?songId=song-1&tolerance=3')
    ).json()) as SongBoardResponse;
    expect(song.entries).toEqual([expect.objectContaining({ name: 'Easy singer', tolerance: 3 })]);
  });

  it('rejects a score sung on a debug pitch width', async () => {
    const response = await submit(await generateSubmission({ tolerance: 4 }));

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: 'Difficulty not eligible' });
  });

  it('accepts a score sung on Hard', async () => {
    const response = await submit(await generateSubmission({ tolerance: 1 }));

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ accepted: true });
  });

  it('rejects a non-integer score', async () => {
    const response = await submit(await generateSubmission({ score: 1_500_000.5 }));

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: 'Invalid score' });
  });

  it('rejects a submission without notes', async () => {
    const response = await submit(await generateSubmission({ notes: new Uint8Array() }));

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: 'Missing notes' });
  });

  it('rejects a notes blob with an implausible record count', async () => {
    const notes = generateNotes(10);
    const response = await submit(await generateSubmission({}, notes));

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: 'Implausible notes' });
  });

  it('rejects a tampered score whose hash no longer matches', async () => {
    const submission = await generateSubmission();
    const response = await submit({ ...submission, score: 3_400_000 });

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: 'Notes hash mismatch' });
  });

  it('rejects an over-long name rather than letting it into the projection', async () => {
    const response = await submit(await generateSubmission({ name: 'x'.repeat(41) }));

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: 'Invalid payload' });
  });

  it('rejects a country that is not an ISO-3166 alpha-2 code', async () => {
    const response = await submit(await generateSubmission({ country: 'Poland' }));

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: 'Invalid country' });
  });

  it('accepts a submission with no country at all', async () => {
    const response = await submit(await generateSubmission({ country: null }));

    expect(await response.json()).toEqual({ accepted: true });
  });

  it('rejects a songLastUpdate that SQL could not bind', async () => {
    // msgpack carries maps and arrays happily; the Durable Object binds this straight into a TEXT
    // column, so an unbindable value used to throw and surface as a 500
    const response = await submit(await generateSubmission({ songLastUpdate: { nested: 'map' } as never }));

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: 'Invalid songLastUpdate' });
  });

  it('serves one cache entry regardless of the query string', async () => {
    await submit(await generateSubmission());

    const withQuery = await SELF.fetch('https://example.com/leaderboard?cache-buster=1');

    expect(((await withQuery.json()) as BoardResponse).entries).toHaveLength(1);
  });

  it('rejects a body that is not msgpack', async () => {
    const response = await SELF.fetch('https://example.com/leaderboard', {
      method: 'POST',
      body: 'definitely not msgpack',
    });

    expect(response.status).toBe(400);
  });

  it('rejects missing required fields', async () => {
    const { name: _name, ...withoutName } = await generateSubmission();
    const response = await submit(withoutName);

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: 'Invalid payload' });
  });

  it('rejects the request when the rate limiter says no', async () => {
    const env: LeaderboardEnv = {
      ...(workerEnv as unknown as LeaderboardEnv),
      LEADERBOARD_RATE_LIMITER: { limit: async () => ({ success: false }) },
    };
    const request = new Request('https://example.com/leaderboard', {
      method: 'POST',
      body: pack(await generateSubmission()),
    });
    const response = await handleLeaderboardSubmit(request, env);

    expect(response.status).toBe(429);
  });

  it('rejects a body over the size cap', async () => {
    const response = await SELF.fetch('https://example.com/leaderboard', {
      method: 'POST',
      body: new Uint8Array(257 * 1024),
    });

    expect(response.status).toBe(413);
  });
});

describe('GET /leaderboard-song', () => {
  const songBoard = (query: string) => SELF.fetch(`https://example.com/leaderboard-song?${query}`);

  it('returns the board for one song and difficulty, and where a score would land on it', async () => {
    await submit(await generateSubmission({ clientId: 'a', name: 'First', score: 2_000_000 }));
    await submit(await generateSubmission({ clientId: 'b', name: 'Second', score: 1_500_000 }));
    await submit(await generateSubmission({ clientId: 'c', name: 'Elsewhere', songId: 'song-2' }));

    const response = await songBoard('songId=song-1&tolerance=2&score=1800000');

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      entries: [
        expect.objectContaining({ name: 'First', score: 2_000_000 }),
        expect.objectContaining({ name: 'Second', score: 1_500_000 }),
      ],
      total: 2,
      position: 2,
    });
  });

  it('omits the position when no score is asked about', async () => {
    await submit(await generateSubmission());

    const payload = (await (await songBoard('songId=song-1&tolerance=2')).json()) as SongBoardResponse;

    expect(payload.position).toBeNull();
    expect(payload.total).toBe(1);
  });

  it("keeps the response out of shared caches — it is keyed on one player's score", async () => {
    const response = await songBoard('songId=song-1&tolerance=2&score=1500000');

    expect(response.headers.get('Cache-Control')).toBe('private, max-age=30');
  });

  it('serves a board for every shipped difficulty, and none for the debug widths', async () => {
    expect((await songBoard('songId=song-1&tolerance=3')).status).toBe(200);
    expect((await songBoard('songId=song-1&tolerance=4')).status).toBe(400);
    expect((await songBoard('songId=song-1&tolerance=0')).status).toBe(400);
    expect((await songBoard('songId=song-1&tolerance=not-a-number')).status).toBe(400);
  });

  it('rejects a missing song id and an out-of-range score', async () => {
    expect((await songBoard('tolerance=2')).status).toBe(400);
    expect((await songBoard(`songId=song-1&tolerance=2&score=${MAX_POINTS + 1}`)).status).toBe(400);
    expect((await songBoard('songId=song-1&tolerance=2&score=-1')).status).toBe(400);
  });

  it('refuses anything but a GET', async () => {
    const response = await SELF.fetch('https://example.com/leaderboard-song?songId=song-1&tolerance=2', {
      method: 'POST',
    });

    expect(response.status).toBe(405);
  });
});

describe('/leaderboard-admin', () => {
  const adminHeaders = { 'x-admin-panel-password': 'admin-password' };

  it('refuses unauthenticated access', async () => {
    expect((await SELF.fetch('https://example.com/leaderboard-admin')).status).toBe(401);
  });

  it('lists rows with ids and deletes them', async () => {
    await submit(await generateSubmission());

    const list = await SELF.fetch('https://example.com/leaderboard-admin', { headers: adminHeaders });
    const { entries } = (await list.json()) as { entries: Array<{ id: string; name: string }> };

    expect(entries).toEqual([expect.objectContaining({ name: 'Player', id: expect.any(String) })]);

    const deletion = await SELF.fetch(`https://example.com/leaderboard-admin?id=${entries[0].id}`, {
      method: 'DELETE',
      headers: adminHeaders,
    });

    expect(deletion.status).toBe(200);

    const missing = await SELF.fetch('https://example.com/leaderboard-admin?id=nope', {
      method: 'DELETE',
      headers: adminHeaders,
    });
    expect(missing.status).toBe(404);

    // Deletion is the moderation path, so the row must leave the cached board immediately
    const board = await SELF.fetch('https://example.com/leaderboard');
    expect(((await board.json()) as BoardResponse).entries).toHaveLength(0);
  });

  it('rebuilds the public board on POST and serves the result straight away', async () => {
    await submit(await generateSubmission());

    const response = await SELF.fetch('https://example.com/leaderboard-admin', {
      method: 'POST',
      headers: adminHeaders,
    });

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ entries: 1 });

    const board = await SELF.fetch('https://example.com/leaderboard');
    expect(((await board.json()) as BoardResponse).entries).toHaveLength(1);
  });

  it('refuses an unauthenticated rebuild', async () => {
    const response = await SELF.fetch('https://example.com/leaderboard-admin', { method: 'POST' });

    expect(response.status).toBe(401);
  });
});
