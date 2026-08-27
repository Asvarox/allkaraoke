import { DurableObject } from 'cloudflare:workers';

// Relative import on purpose: the `~` alias is only configured for the app build, not the Worker one
import {
  AdminBoardEntry,
  BOARD_KV_KEY,
  BoardEntry,
  BoardResponse,
  LeaderboardSubmission,
} from '../src/modules/leaderboard/types';

export interface LeaderboardDurableObjectEnv {
  LEADERBOARD_KV?: KVNamespace;
}

/** Rows older than this drop out of the board and their notes blobs are deleted. */
export const RETENTION_MS = 14 * 24 * 60 * 60 * 1000;

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

  /** Top {@link BOARD_SIZE} rows of the retention window, in public shape. Never selects `notes`. */
  projection(): BoardResponse {
    const rows = this.sql
      .exec<RecordRow>(
        `SELECT id, name, country, score, artist, title, song_id, tolerance, created_at
         FROM records WHERE created_at >= ? ORDER BY score DESC, created_at ASC LIMIT ?`,
        Date.now() - RETENTION_MS,
        BOARD_SIZE,
      )
      .toArray();

    return { generatedAt: Date.now(), entries: rows.map(toBoardEntry) };
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

  async alarm() {
    const cutoff = Date.now() - RETENTION_MS;

    // Notes reference records, and SQLite enforces the foreign key — blobs go first
    this.sql.exec(`DELETE FROM notes WHERE record_id IN (SELECT id FROM records WHERE created_at < ?)`, cutoff);
    this.sql.exec(`DELETE FROM records WHERE created_at < ?`, cutoff);
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
