import { DurableObject } from 'cloudflare:workers';

// Relative import on purpose: the `~` alias is only configured for the app build, not the Worker one
import { MAX_GLOBAL_BOARD_TOLERANCE, SONG_BOARD_NEIGHBOURS, SONG_BOARD_SIZE } from '../src/modules/leaderboard/consts';
import {
  AdminBoardEntry,
  BOARD_KV_KEY,
  BoardEntry,
  BoardResponse,
  LeaderboardSubmission,
  SongBoardResponse,
} from '../src/modules/leaderboard/types';

export interface LeaderboardDurableObjectEnv {
  LEADERBOARD_KV?: KVNamespace;
}

/**
 * How far back the global board on the main menu looks. Rows older than this stop being ranked
 * there; they are not deleted, and the per-song boards keep them.
 */
export const GLOBAL_BOARD_WINDOW_MS = 14 * 24 * 60 * 60 * 1000;

/**
 * How long the sung frequency records are kept. The blobs are the only large thing stored — a row
 * is a couple of hundred bytes, a blob up to 256 KB — and nothing reads them yet, so they are the
 * part that expires. The rows themselves are kept indefinitely, which is what makes the per-song
 * boards all-time.
 */
export const NOTES_RETENTION_MS = 14 * 24 * 60 * 60 * 1000;

/** How many rows the projection keeps. Every accepted submission is stored regardless. */
export const BOARD_SIZE = 50;

const ALARM_INTERVAL_MS = 24 * 60 * 60 * 1000;

/**
 * Trimmed, casefolded, whitespace-collapsed. Part of the dedupe key, so a player who re-sings a
 * song under the same name replaces their row instead of adding one.
 */
export const normalizeName = (name: string) => name.trim().replace(/\s+/g, ' ').toLowerCase();

interface RecordRow {
  id: string;
  name: string;
  country: string | null;
  score: number;
  artist: string;
  title: string;
  song_id: string;
  tolerance: number;
  created_at: number;
}

const toBoardEntry = (row: RecordRow): BoardEntry => ({
  name: row.name,
  country: row.country,
  score: row.score,
  artist: row.artist,
  title: row.title,
  songId: row.song_id,
  tolerance: row.tolerance,
  createdAt: row.created_at,
});

export interface SubmitResult {
  accepted: boolean;
  /** `false` when an equal or better score for the same (client, song, name) already exists. */
  reason?: 'lower-score' | 'invalid';
}

export class LeaderboardBoard extends DurableObject<LeaderboardDurableObjectEnv> {
  private get sql() {
    return this.ctx.storage.sql;
  }

  constructor(ctx: DurableObjectState, env: LeaderboardDurableObjectEnv) {
    super(ctx, env);

    ctx.blockConcurrencyWhile(async () => {
      this.createSchema();

      if ((await ctx.storage.getAlarm()) === null) {
        await ctx.storage.setAlarm(Date.now() + ALARM_INTERVAL_MS);
      }
    });
  }

  private createSchema() {
    this.sql.exec(`
      CREATE TABLE IF NOT EXISTS records (
        id               TEXT PRIMARY KEY,
        client_id        TEXT NOT NULL,
        song_id          TEXT NOT NULL,
        artist           TEXT NOT NULL,
        title            TEXT NOT NULL,
        song_last_update TEXT,
        name             TEXT NOT NULL,
        name_normalized  TEXT NOT NULL,
        country          TEXT,
        score            INTEGER NOT NULL,
        tolerance        INTEGER NOT NULL,
        mode             TEXT NOT NULL,
        track_index      INTEGER NOT NULL,
        input_lag        INTEGER NOT NULL,
        notes_hash       TEXT NOT NULL,
        created_at       INTEGER NOT NULL
      );
    `);
    this.sql.exec(`CREATE UNIQUE INDEX IF NOT EXISTS records_dedupe ON records (client_id, song_id, name_normalized);`);
    this.sql.exec(`CREATE INDEX IF NOT EXISTS records_score ON records (score DESC);`);
    this.sql.exec(`CREATE INDEX IF NOT EXISTS records_created_at ON records (created_at);`);
    // Covers all three per-song queries — the count, the rank, and the window — in the order they
    // read. Rows are never deleted now, so these run over a table that only grows.
    this.sql.exec(
      `CREATE INDEX IF NOT EXISTS records_song_board ON records (song_id, tolerance, score DESC, created_at ASC);`,
    );
    this.sql.exec(`
      CREATE TABLE IF NOT EXISTS notes (
        record_id TEXT PRIMARY KEY REFERENCES records (id),
        blob      BLOB NOT NULL
      );
    `);
  }

  /**
   * Stores one submission, keeping the higher score for a repeated (client, song, name), and
   * rebuilds the KV projection. Rate limiting is not handled here — it lives entirely in the
   * binding at the Worker edge.
   */
  async submit(submission: LeaderboardSubmission, notesBlob: Uint8Array): Promise<SubmitResult> {
    const name = submission.name.trim();
    const nameNormalized = normalizeName(submission.name);

    if (!name || !nameNormalized || !submission.clientId || !submission.songId || !Number.isFinite(submission.score)) {
      return { accepted: false, reason: 'invalid' };
    }

    const existing = this.sql
      .exec<{ id: string; score: number }>(
        `SELECT id, score FROM records WHERE client_id = ? AND song_id = ? AND name_normalized = ?`,
        submission.clientId,
        submission.songId,
        nameNormalized,
      )
      .toArray()[0];

    if (existing && existing.score >= submission.score) {
      return { accepted: false, reason: 'lower-score' };
    }

    const id = existing?.id ?? crypto.randomUUID();
    const createdAt = Date.now();

    if (existing) {
      this.sql.exec(
        `UPDATE records SET artist = ?, title = ?, song_last_update = ?, name = ?, country = ?, score = ?,
           tolerance = ?, mode = ?, track_index = ?, input_lag = ?, notes_hash = ?, created_at = ?
         WHERE id = ?`,
        submission.artist,
        submission.title,
        submission.songLastUpdate,
        name,
        submission.country,
        submission.score,
        submission.tolerance,
        submission.mode,
        submission.trackIndex,
        submission.inputLag,
        submission.notesHash,
        createdAt,
        id,
      );
      this.sql.exec(`DELETE FROM notes WHERE record_id = ?`, id);
    } else {
      this.sql.exec(
        `INSERT INTO records (id, client_id, song_id, artist, title, song_last_update, name, name_normalized,
           country, score, tolerance, mode, track_index, input_lag, notes_hash, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        id,
        submission.clientId,
        submission.songId,
        submission.artist,
        submission.title,
        submission.songLastUpdate,
        name,
        nameNormalized,
        submission.country,
        submission.score,
        submission.tolerance,
        submission.mode,
        submission.trackIndex,
        submission.inputLag,
        submission.notesHash,
        createdAt,
      );
    }

    this.sql.exec(`INSERT INTO notes (record_id, blob) VALUES (?, ?)`, id, notesBlob);

    await this.rebuildProjection();

    return { accepted: true };
  }

  /**
   * Top {@link BOARD_SIZE} rows of the retention window, in public shape. Never selects `notes`.
   *
   * The difficulty filter is not only about rows submitted before the rule existed — the admin
   * listing still shows everything, so the board is where "Medium or harder" has to hold.
   */
  projection(): BoardResponse {
    const rows = this.sql
      .exec<RecordRow>(
        `SELECT id, name, country, score, artist, title, song_id, tolerance, created_at
         FROM records WHERE created_at >= ? AND tolerance <= ? ORDER BY score DESC, created_at ASC LIMIT ?`,
        Date.now() - GLOBAL_BOARD_WINDOW_MS,
        MAX_GLOBAL_BOARD_TOLERANCE,
        BOARD_SIZE,
      )
      .toArray();

    return { generatedAt: Date.now(), entries: rows.map(toBoardEntry) };
  }

  /**
   * The board for one song at one difficulty, plus where a given score would land on it.
   *
   * Unlike {@link projection} this is read straight off the Durable Object — there is no KV
   * projection to serve it from. A projection per (song, difficulty) would be thousands of KV
   * values rewritten on every submission, and the read happens once per finished song rather than
   * on every main-menu load, so the DO read is the cheaper side of that trade.
   *
   * All-time, with no date window: a song's board is not a leaderboard anyone races weekly, and
   * cutting it to a fortnight would empty it for every song nobody happened to sing lately.
   *
   * Difficulty is an exact match, not `<=`: a wider pitch window is a different game, so Medium
   * rows would flatter a Hard singer and vice versa. The vocal track is deliberately ignored.
   */
  songBoard(songId: string, tolerance: number, score: number | null): SongBoardResponse {
    const total =
      this.sql
        .exec<{ count: number }>(
          `SELECT COUNT(*) AS count FROM records WHERE song_id = ? AND tolerance = ?`,
          songId,
          tolerance,
        )
        .toArray()[0]?.count ?? 0;

    // `>=`, not `>`: a submitted tie gets a later `created_at` and so sorts behind the row that got
    // there first, which is the order the board itself would put it in. The cost is that a score
    // already on the board is ranked one place below where it sits — the caller is asking where a
    // score *would* land, and it is answered before the submission goes out.
    const position =
      score === null
        ? null
        : (this.sql
            .exec<{ count: number }>(
              `SELECT COUNT(*) AS count FROM records WHERE song_id = ? AND tolerance = ? AND score >= ?`,
              songId,
              tolerance,
              score,
            )
            .toArray()[0]?.count ?? 0) + 1;

    /*
     * With a score to place, the window is the rows either side of it rather than the top of the
     * board: `position` splits the table at index `position - 1`, so `SONG_BOARD_NEIGHBOURS` rows
     * before that index are above the player and the same number from it are below. Being told you
     * are 4,000th under a list of people you will never catch says nothing; your neighbours do.
     */
    const [offset, limit] =
      position === null
        ? [0, SONG_BOARD_SIZE]
        : [Math.max(0, position - 1 - SONG_BOARD_NEIGHBOURS), SONG_BOARD_NEIGHBOURS * 2];

    const rows = this.sql
      .exec<RecordRow>(
        `SELECT id, name, country, score, artist, title, song_id, tolerance, created_at
         FROM records WHERE song_id = ? AND tolerance = ?
         ORDER BY score DESC, created_at ASC LIMIT ? OFFSET ?`,
        songId,
        tolerance,
        limit,
        offset,
      )
      .toArray();

    return { entries: rows.map(toBoardEntry), total, startPosition: offset + 1, position };
  }

  /** Every stored row, newest first, including ids. Authenticated admin use only. */
  listForAdmin(): AdminBoardEntry[] {
    return this.sql
      .exec<RecordRow>(
        `SELECT id, name, country, score, artist, title, song_id, tolerance, created_at
         FROM records ORDER BY created_at DESC`,
      )
      .toArray()
      .map((row) => ({ id: row.id, ...toBoardEntry(row) }));
  }

  async deleteRow(id: string): Promise<boolean> {
    const existing = this.sql.exec<{ id: string }>(`SELECT id FROM records WHERE id = ?`, id).toArray();

    if (existing.length === 0) return false;

    this.sql.exec(`DELETE FROM notes WHERE record_id = ?`, id);
    this.sql.exec(`DELETE FROM records WHERE id = ?`, id);

    await this.rebuildProjection();

    return true;
  }

  /**
   * Rebuilds the KV projection from the rows as they stand. Nothing else needs this — every write
   * path rebuilds on its own — but a change to what `projection()` selects (a new filter, a new
   * board size) only reaches the public board on the next write or the daily alarm, and this is
   * the way to apply it on deploy instead of waiting a day.
   */
  async rebuild(): Promise<{ entries: number }> {
    await this.rebuildProjection();

    return { entries: this.projection().entries.length };
  }

  async alarm() {
    const cutoff = Date.now() - NOTES_RETENTION_MS;

    // Only the blobs expire. The rows stay: the per-song boards are all-time, and the global board
    // does its own windowing in `projection()` rather than relying on rows being gone.
    this.sql.exec(`DELETE FROM notes WHERE record_id IN (SELECT id FROM records WHERE created_at < ?)`, cutoff);
    this.sql.exec(`DELETE FROM notes WHERE record_id NOT IN (SELECT id FROM records)`);

    await this.rebuildProjection();
    await this.ctx.storage.setAlarm(Date.now() + ALARM_INTERVAL_MS);
  }

  private async rebuildProjection() {
    const kv = this.env.LEADERBOARD_KV;
    if (!kv) return;

    try {
      await kv.put(BOARD_KV_KEY, JSON.stringify(this.projection()));
    } catch (error) {
      // KV allows one write per second per key and 429s the rest. The record itself is already
      // committed to SQLite, which is the source of truth — failing the whole submission over a
      // projection that the next accepted write (or the daily alarm) rebuilds anyway would throw
      // away the row for no gain. The board is at most one submission stale until then.
      console.error('Failed to write the leaderboard projection to KV', error);
    }
  }
}
