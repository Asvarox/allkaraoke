import { spawn, type ChildProcess } from 'node:child_process';
import net from 'node:net';
import path from 'node:path';

import { chromium, type Browser, type Page } from 'playwright';

const DEFAULT_TIMEOUT_MS = 30000;

async function findFreePort(): Promise<number> {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.unref();
    server.on('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const address = server.address();
      if (!address || typeof address === 'string') {
        reject(new Error('Unable to resolve a free localhost port'));
        return;
      }

      const { port } = address;
      server.close(() => resolve(port));
    });
  });
}

async function waitForServerReady(url: string, timeoutMs: number): Promise<void> {
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        return;
      }
    } catch {
      // Keep polling until timeout.
    }

    await new Promise((resolve) => setTimeout(resolve, 200));
  }

  throw new Error(`Timed out waiting for static server at ${url}`);
}

function startStaticServer(port: number): ChildProcess {
  return spawn('pnpm', ['exec', 'serve', '--no-request-logging', '-l', String(port), '.'], {
    cwd: path.resolve(__dirname, '..'),
    stdio: 'ignore',
  });
}

interface ProbeResult {
  status: string | null;
  durationSeconds: number;
  errorText: string;
}

async function readProbeResult(page: Page, probeUrl: string, timeoutMs: number): Promise<ProbeResult> {
  await page.goto(probeUrl, { waitUntil: 'domcontentloaded', timeout: timeoutMs });

  await page.waitForFunction(
    () => {
      const status = document.getElementById('status')?.getAttribute('data-status');
      return status === 'done' || status === 'error';
    },
    { timeout: timeoutMs },
  );

  return page.evaluate(() => {
    const status = document.getElementById('status')?.getAttribute('data-status') ?? null;
    const durationText = document.getElementById('duration-seconds')?.textContent ?? '';
    const errorText = document.getElementById('error-message')?.textContent ?? '';

    return {
      status,
      durationSeconds: Number(durationText),
      errorText,
    };
  });
}

export interface YoutubeDurationProbeClient {
  getDuration(videoId: string): Promise<number>;
  close(): Promise<void>;
}

export async function createYoutubeDurationProbeClient(
  timeoutMs: number = DEFAULT_TIMEOUT_MS,
): Promise<YoutubeDurationProbeClient> {
  if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) {
    throw new Error('Timeout must be a positive number');
  }

  const port = await findFreePort();
  const baseUrl = `http://localhost:${port}`;
  const probePath = '/scripts/youtube-duration-probe';
  const serverProcess = startStaticServer(port);

  let browser: Browser | null = null;
  let page: Page | null = null;

  await waitForServerReady(`${baseUrl}${probePath}`, timeoutMs);
  browser = await chromium.launch({ headless: true });
  page = await browser.newPage();

  return {
    async getDuration(videoId: string): Promise<number> {
      if (!videoId) {
        throw new Error('videoId cannot be empty');
      }

      if (!page) {
        throw new Error('Probe page is not available');
      }

      const probeUrl = `${baseUrl}${probePath}?videoId=${encodeURIComponent(videoId)}&timeoutMs=${Math.round(timeoutMs)}`;
      const probeResult = await readProbeResult(page, probeUrl, timeoutMs);

      if (probeResult.status !== 'done') {
        throw new Error(probeResult.errorText || 'Probe finished with an unknown error status');
      }

      if (!Number.isFinite(probeResult.durationSeconds) || probeResult.durationSeconds <= 0) {
        throw new Error(`Probe returned invalid duration: ${probeResult.durationSeconds}`);
      }

      return Math.round(probeResult.durationSeconds);
    },
    async close() {
      if (browser) {
        await browser.close();
      }

      if (serverProcess && !serverProcess.killed) {
        serverProcess.kill('SIGTERM');
      }
    },
  };
}
