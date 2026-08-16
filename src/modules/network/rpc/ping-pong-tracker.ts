export interface PingPongTrackerOptions {
  /** Delay between a pong arriving and the next ping going out. */
  intervalMs?: number;
  /** Latency reported before the first round trip completes. */
  initialLatency?: number;
  /** Called with every fresh measurement — remote mic reports pings to analytics through it. */
  onMeasurement?: (latencyMs: number) => void;
  /** Maximum time to wait for a pong before giving up on it and re-arming the loop. */
  maxWaitMs?: number;
}

/** Round-trip latency loop shared by the remote-mic and online clients: send a ping, measure the
 * pong, re-arm after `intervalMs`. The caller owns the transport — it hands in a send function and
 * feeds back the pongs it receives, so the tracker stays transport- and protocol-agnostic. */
export class PingPongTracker {
  private readonly intervalMs: number;
  private readonly maxWaitMs: number;
  private latencyMs: number;
  private pingStartedAt = 0;
  private timeout: ReturnType<typeof setTimeout> | null = null;
  private watchdog: ReturnType<typeof setTimeout> | null = null;
  private send: (() => void) | null = null;

  public constructor(private readonly options: PingPongTrackerOptions = {}) {
    this.intervalMs = options.intervalMs ?? 2_000;
    this.maxWaitMs = options.maxWaitMs ?? 10_000;
    this.latencyMs = options.initialLatency ?? 0;
  }

  /** Starts (or restarts) the loop: pings right away, then again after every pong. */
  public start = (send: () => void): void => {
    if (this.timeout) clearTimeout(this.timeout);
    if (this.watchdog) clearTimeout(this.watchdog);
    this.timeout = null;
    this.watchdog = null;
    this.send = send;
    this.ping();
  };

  private ping = () => {
    this.timeout = null;
    this.pingStartedAt = Date.now();
    this.send?.();
    this.watchdog = setTimeout(this.handleMissingPong, this.maxWaitMs);
  };

  /** Feed in an incoming pong: records the round trip and schedules the next ping. Pongs arriving
   * without a ping in flight are ignored, so the loop can never fork into two. */
  public handlePong = (): void => {
    if (!this.pingStartedAt) return;
    if (this.watchdog) clearTimeout(this.watchdog);
    this.watchdog = null;
    this.latencyMs = Date.now() - this.pingStartedAt;
    this.pingStartedAt = 0;
    this.options.onMeasurement?.(this.latencyMs);
    this.timeout = setTimeout(this.ping, this.intervalMs);
  };

  /** A pong never arrived within maxWaitMs: drop the stale ping and re-arm so the loop keeps running. */
  private handleMissingPong = (): void => {
    this.watchdog = null;
    this.pingStartedAt = 0;
    this.timeout = setTimeout(this.ping, this.intervalMs);
  };

  /** Latest measured round-trip latency, ms. */
  public getLatency = (): number => this.latencyMs;

  /** True between a ping going out and its pong coming back. */
  public isPinging = (): boolean => this.pingStartedAt !== 0;

  /** When the outstanding ping was sent (0 when none is in flight) — lets a readout keep counting
   * up while a pong is overdue instead of showing the last, stale measurement. */
  public getPingStartedAt = (): number => this.pingStartedAt;

  /** Stops the loop and drops the outstanding ping. */
  public stop = (): void => {
    if (this.timeout) clearTimeout(this.timeout);
    if (this.watchdog) clearTimeout(this.watchdog);
    this.timeout = null;
    this.watchdog = null;
    this.pingStartedAt = 0;
  };
}
