import { describe, expect, it } from 'vitest';
import {
  chartByteSize,
  ChartTooLargeError,
  ChartValidationError,
  compressChart,
  decompressChart,
  hashChart,
  prepareChartTransfer,
  unpackChartTransfer,
} from '~/modules/online/protocol/chart-transfer';
import { ONLINE_MAX_CHART_BYTES } from '~/modules/online/protocol/consts';

const source = { songId: 'song-1', artist: 'Artist', title: 'Title', video: 'abc123' };

describe('compressChart / decompressChart', () => {
  it('round-trips chart txt losslessly, including unicode', async () => {
    const txt = '#ARTIST:Zażółć gęślą jaźń 🎤🎶\n: 0 4 59 Test\nE\n'.repeat(100);
    const compressed = await compressChart(txt);
    expect(await decompressChart(compressed)).toEqual(txt);
  });

  it('actually compresses typical chart content', async () => {
    const txt = ': 0 4 59 la\n: 5 4 59 la\n'.repeat(1_000); // ~24 KB of repetitive txt
    const compressed = await compressChart(txt);
    expect(compressed.length).toBeLessThan(txt.length / 10);
  });
});

describe('prepareChartTransfer', () => {
  it('builds a manifest with hash and length', async () => {
    const txt = 'x'.repeat(100);
    const { manifest, data } = await prepareChartTransfer(source, txt);
    expect(manifest).toMatchObject({ songId: 'song-1', length: 100 });
    expect(manifest.hash).toEqual(hashChart(txt));
    expect(await decompressChart(data)).toEqual(txt);
  });

  it('throws for oversized charts', async () => {
    const txt = 'x'.repeat(ONLINE_MAX_CHART_BYTES + 1);
    await expect(prepareChartTransfer(source, txt)).rejects.toThrow(ChartTooLargeError);
  });

  it('measures size in bytes, not characters', () => {
    expect(chartByteSize('🎤')).toBe(4);
    expect(chartByteSize('a')).toBe(1);
  });
});

describe('unpackChartTransfer', () => {
  it('reconstructs and validates the chart', async () => {
    const txt = 'some chart content with unicode 🎤🎶';
    const { manifest, data } = await prepareChartTransfer(source, txt);
    expect(await unpackChartTransfer(manifest, data)).toEqual(txt);
  });

  it('rejects garbage payloads', async () => {
    const { manifest } = await prepareChartTransfer(source, 'y'.repeat(50));
    await expect(unpackChartTransfer(manifest, 'bm90IGd6aXBwZWQ=')).rejects.toThrow(ChartValidationError);
  });

  it('rejects payloads that do not match the manifest hash', async () => {
    const { manifest } = await prepareChartTransfer(source, 'z'.repeat(50));
    const otherData = await compressChart('q'.repeat(50));
    await expect(unpackChartTransfer(manifest, otherData)).rejects.toThrow('hash mismatch');
  });

  it('rejects length mismatches', async () => {
    const { manifest, data } = await prepareChartTransfer(source, 'w'.repeat(50));
    await expect(unpackChartTransfer({ ...manifest, length: 49 }, data)).rejects.toThrow('length mismatch');
  });

  it('rejects payloads that decompress to an oversized chart', async () => {
    const txt = 'x'.repeat(ONLINE_MAX_CHART_BYTES + 1);
    const data = await compressChart(txt);
    const manifest = { ...source, hash: hashChart(txt), length: txt.length };
    await expect(unpackChartTransfer(manifest, data)).rejects.toThrow(ChartTooLargeError);
  });
});
