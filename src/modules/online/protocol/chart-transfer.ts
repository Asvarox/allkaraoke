import { ONLINE_MAX_CHART_BYTES } from './consts';
import { ChartManifest } from './types';

/** FNV-1a 32-bit hash — integrity check for the transferred chart, not a security measure. */
export const hashChart = (txt: string): string => {
  let hash = 0x811c9dc5;
  for (let i = 0; i < txt.length; i++) {
    hash ^= txt.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash.toString(16).padStart(8, '0');
};

export const chartByteSize = (txt: string): number => new TextEncoder().encode(txt).length;

export class ChartTooLargeError extends Error {
  constructor(bytes: number) {
    super(`Chart is too large to transfer (${bytes} bytes, max ${ONLINE_MAX_CHART_BYTES})`);
  }
}

export class ChartValidationError extends Error {}

const bytesToBase64 = (bytes: Uint8Array): string => {
  let binary = '';
  // Convert in slices to stay clear of argument-count limits for large arrays
  const SLICE = 0x8000;
  for (let i = 0; i < bytes.length; i += SLICE) {
    binary += String.fromCharCode(...bytes.subarray(i, i + SLICE));
  }
  return btoa(binary);
};

const base64ToBytes = (base64: string): Uint8Array => {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
};

/** Gzips the chart txt and returns it base64-encoded, so even the largest charts
 * (~30 KB raw) comfortably fit in a single websocket message. */
export const compressChart = async (txt: string): Promise<string> => {
  const stream = new Blob([txt]).stream().pipeThrough(new CompressionStream('gzip'));
  const buffer = await new Response(stream).arrayBuffer();
  return bytesToBase64(new Uint8Array(buffer));
};

export const decompressChart = async (data: string): Promise<string> => {
  const stream = new Blob([base64ToBytes(data) as BlobPart]).stream().pipeThrough(new DecompressionStream('gzip'));
  return await new Response(stream).text();
};

export interface ChartTransferSource {
  songId: string;
  artist: string;
  title: string;
  video: string;
}

/** Builds the manifest + compressed payload for a serialized chart.
 * Throws ChartTooLargeError when the raw txt is oversized. */
export const prepareChartTransfer = async (
  source: ChartTransferSource,
  txt: string,
): Promise<{ manifest: ChartManifest; data: string }> => {
  const bytes = chartByteSize(txt);
  if (bytes > ONLINE_MAX_CHART_BYTES) {
    throw new ChartTooLargeError(bytes);
  }
  return {
    manifest: {
      songId: source.songId,
      artist: source.artist,
      title: source.title,
      video: source.video,
      hash: hashChart(txt),
      length: txt.length,
    },
    data: await compressChart(txt),
  };
};

/** Decompresses a transferred chart and validates it against the manifest. */
export const unpackChartTransfer = async (manifest: ChartManifest, data: string): Promise<string> => {
  let txt: string;
  try {
    txt = await decompressChart(data);
  } catch {
    throw new ChartValidationError('Chart data is corrupted (failed to decompress)');
  }
  const bytes = chartByteSize(txt);
  if (bytes > ONLINE_MAX_CHART_BYTES) {
    throw new ChartTooLargeError(bytes);
  }
  if (txt.length !== manifest.length) {
    throw new ChartValidationError(`Chart length mismatch (got ${txt.length}, expected ${manifest.length})`);
  }
  if (hashChart(txt) !== manifest.hash) {
    throw new ChartValidationError('Chart hash mismatch');
  }
  return txt;
};
