import { pack, unpack } from 'msgpackr';

// Relative and type-only on purpose: the Worker decodes payloads too, and the `~` alias is not
// configured for the Worker bundle.
import type { PlayerNote } from '../../interfaces';

// Frequency records are stored as [timestampDelta, frequencyDelta] pairs of integers scaled by
// PRECISION_SCALE. Deltas are computed over the *scaled* values so decoding is exact at that
// precision instead of accumulating rounding error over tens of thousands of records.
const PRECISION_SCALE = 100;

export type PackedRecord = number | [number, number];

export interface DecodedFrequencyRecord {
  timestamp: number;
  frequency: number;
}

/**
 * Packs every frequency record of a single player into msgpack bytes.
 *
 * All records are kept — including misses and pitch jitter. A hits-only stream is
 * indistinguishable from a synthesized perfect one, which would make the blob useless for the
 * score verification it exists for.
 */
export function encodeNotesPayload(playerNotes: PlayerNote[]): Uint8Array {
  const records: PackedRecord[] = [];

  let previousTimestamp = 0;
  let previousFrequency = 0;

  for (const playerNote of playerNotes) {
    for (const record of playerNote.frequencyRecords ?? []) {
      const timestamp = Math.round(record.timestamp * PRECISION_SCALE);
      const frequency = Math.round(record.frequency * PRECISION_SCALE);

      const timestampDelta = timestamp - previousTimestamp;
      const frequencyDelta = frequency - previousFrequency;

      previousTimestamp = timestamp;
      previousFrequency = frequency;

      // A zero frequency delta is common (silence), so store the timestamp delta alone
      records.push(frequencyDelta === 0 ? timestampDelta : [timestampDelta, frequencyDelta]);
    }
  }

  return pack(records);
}

export function decodeNotesPayload(payload: Uint8Array): DecodedFrequencyRecord[] {
  const records = unpack(payload as Uint8Array<ArrayBuffer>) as PackedRecord[];

  const decoded: DecodedFrequencyRecord[] = [];

  let timestamp = 0;
  let frequency = 0;

  for (const record of records) {
    const [timestampDelta, frequencyDelta] = typeof record === 'number' ? [record, 0] : record;

    timestamp += timestampDelta;
    frequency += frequencyDelta;

    decoded.push({ timestamp: timestamp / PRECISION_SCALE, frequency: frequency / PRECISION_SCALE });
  }

  return decoded;
}

export function countFrequencyRecords(playerNotes: PlayerNote[]): number {
  return playerNotes.reduce((count, playerNote) => count + (playerNote.frequencyRecords?.length ?? 0), 0);
}
