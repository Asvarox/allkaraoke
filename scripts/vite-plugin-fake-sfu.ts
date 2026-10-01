import { spawn } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { connect } from 'node:net';
import path from 'node:path';
import { parseEnv } from 'node:util';

import type { Plugin } from 'vite';

/** Whether the project's `.dev.vars` — the file the Cloudflare plugin gives the Worker its secrets
 * from — holds a Realtime app, i.e. whether online mode can talk to the real SFU. */
export function hasRealtimeCredentials(root: string): boolean {
  const file = path.join(root, '.dev.vars');
  const vars = existsSync(file) ? parseEnv(readFileSync(file, 'utf8')) : {};
  return Boolean(vars.REALTIME_APP_ID && vars.REALTIME_APP_TOKEN);
}

const isListening = (port: number) =>
  new Promise<boolean>((resolve) => {
    const socket = connect({ port, host: '127.0.0.1' });
    socket.once('connect', () => (socket.destroy(), resolve(true)));
    socket.once('error', () => resolve(false));
  });

const START_TIMEOUT_MS = 15_000;

/**
 * Runs the fake Cloudflare Realtime SFU (`tests/fake-sfu`) next to the dev server, so online mode
 * works on a checkout with no Realtime app. The Worker is pointed at it by the Cloudflare plugin's
 * options in `vite.config.mts`; this only keeps the process alive for as long as the dev server is.
 *
 * An SFU already listening on the port is reused rather than fought over.
 */
export function fakeSfu({ port }: { port: number }): Plugin {
  return {
    name: 'fake-sfu',
    apply: 'serve',
    async configureServer(server) {
      const { logger } = server.config;
      if (await isListening(port)) return;

      const child = spawn(process.execPath, ['tests/fake-sfu/server.mts'], {
        cwd: server.config.root,
        env: { ...process.env, FAKE_SFU_PORT: String(port) },
        stdio: ['ignore', 'ignore', 'inherit'],
      });
      const stop = () => child.kill();
      process.once('exit', stop);
      server.httpServer?.once('close', stop);
      child.once('error', (error) => logger.error(`fake SFU failed to start: ${error.message}`));

      const startedAt = Date.now();
      while (!(await isListening(port))) {
        if (child.exitCode !== null || Date.now() - startedAt > START_TIMEOUT_MS) {
          logger.error(`fake SFU did not come up on port ${port} - online mode will not connect`);
          return;
        }
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
      logger.info(`online mode: no Realtime credentials in .dev.vars, using the fake SFU on :${port}`);
    },
  };
}
