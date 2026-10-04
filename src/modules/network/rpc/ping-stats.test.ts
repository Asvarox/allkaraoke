import { describe, expect, it } from 'vitest';

import { PingSampler, summarizePings } from '~/modules/network/rpc/ping-stats';

describe('summarizePings', () => {
  it('summarises a window of pings', () => {
    const pings = [40, 60, 50, 200, 50, 45, 55, 48, 52, 300];

    expect(summarizePings(pings, 2)).toEqual({
      samples: 10,
      timeouts: 2,
      min: 40,
      max: 300,
      avg: 90,
      median: 50,
      p95: 300,
      jitter: 67,
    });
  });

  it('takes the nearest-rank percentile, so a single outlier in twenty does not move the p95', () => {
    const pings = [...Array.from({ length: 19 }, () => 50), 900];

    expect(summarizePings(pings)).toMatchObject({ median: 50, p95: 50, max: 900 });
  });

  it('has nothing to say about an empty window', () => {
    expect(summarizePings([])).toBeNull();
  });
});

describe('PingSampler', () => {
  it('ignores pings outside a window', () => {
    const sampler = new PingSampler();
    sampler.record(100);
    sampler.recordTimeout();

    sampler.start();
    sampler.record(20);

    expect(sampler.finish()).toMatchObject({ samples: 1, timeouts: 0, avg: 20 });
  });

  it('closes the window once it has been reported', () => {
    const sampler = new PingSampler();
    sampler.start();
    sampler.record(20);
    sampler.finish();

    expect(sampler.isActive()).toBe(false);
    expect(sampler.finish()).toBeNull();
  });
});
