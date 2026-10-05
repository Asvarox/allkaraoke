/** One window of round-trip measurements, summarised for analytics. Milliseconds throughout; the
 * latency figures are null when every ping of the window timed out. */
export interface PingStats {
  samples: number;
  /** Pings whose pong never came back within the tracker's wait — lost, or stuck behind a stall. */
  timeouts: number;
  min: number | null;
  max: number | null;
  avg: number | null;
  median: number | null;
  p95: number | null;
  /** Mean difference between consecutive measurements, in the order they were taken. */
  jitter: number | null;
}

/** Nearest-rank percentile of an ascending list. */
const percentile = (sorted: number[], fraction: number) =>
  sorted[Math.min(sorted.length - 1, Math.max(0, Math.ceil(fraction * sorted.length) - 1))];

export const summarizePings = (pings: number[], timeouts = 0): PingStats | null => {
  if (!pings.length) {
    // A window where nothing came back is the worst reading there is, not a missing one
    if (!timeouts) return null;
    return { samples: 0, timeouts, min: null, max: null, avg: null, median: null, p95: null, jitter: null };
  }
  const sorted = [...pings].sort((a, b) => a - b);
  const jitter =
    pings.length > 1
      ? pings.slice(1).reduce((sum, ping, index) => sum + Math.abs(ping - pings[index]), 0) / (pings.length - 1)
      : 0;

  return {
    samples: pings.length,
    timeouts,
    min: sorted[0],
    max: sorted.at(-1)!,
    avg: Math.round(pings.reduce((sum, ping) => sum + ping, 0) / pings.length),
    median: percentile(sorted, 0.5),
    p95: percentile(sorted, 0.95),
    jitter: Math.round(jitter),
  };
};

/**
 * Collects the pings of one window — a song — so it can be reported as a single event instead of a
 * sample every so often. Inactive until `start()`, so a ping loop can feed it unconditionally.
 */
export class PingSampler {
  private pings: number[] | null = null;
  private timeouts = 0;

  public start = () => {
    this.pings = [];
    this.timeouts = 0;
  };

  public isActive = () => this.pings !== null;

  public record = (ping: number) => {
    this.pings?.push(ping);
  };

  public recordTimeout = () => {
    if (this.pings) this.timeouts += 1;
  };

  /** Ends the window and returns its summary — null when it was not running or caught nothing. */
  public finish = (): PingStats | null => {
    const stats = this.pings ? summarizePings(this.pings, this.timeouts) : null;
    this.pings = null;
    this.timeouts = 0;
    return stats;
  };
}
