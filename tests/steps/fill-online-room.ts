import { Browser, BrowserContext, test } from '@playwright/test';

import { ONLINE_MAX_PLAYERS } from '~/modules/players/player-number';

/**
 * Occupies every seat but the host's, at the protocol level.
 *
 * Five real guest tabs each holding a live fake-audio capture reliably deadlocks Chromium's
 * fake-audio backend, so the seats are filled the way the client fills them — claim a slot in the
 * room directory, open that slot's pipe, say hello — without the game running around them. Only
 * the final, rejected join goes through the real UI, which is the part under test.
 *
 * The work happens inside a page rather than in the test process. The app's origin is only
 * reliably reachable from a browser: in the CI container `vite preview` binds a localhost that
 * Node's `fetch` resolves to an address nothing is listening on, so the same requests that a page
 * makes happily fail from the runner with ECONNREFUSED.
 *
 * Returns the context holding the sockets; closing it frees the seats.
 */
export async function fillOnlineRoom(browser: Browser, roomCode: string): Promise<BrowserContext> {
  const context = await browser.newContext({ baseURL: test.info().project.use.baseURL });
  try {
    const page = await context.newPage();
    // Any page on the app's origin will do — it is only here to make the requests same-origin.
    await page.goto('/online/?e2e-test');

    await page.evaluate(
      async ({ roomCode, seats }) => {
        // Parked on `window` so the sockets outlive this call and keep their seats claimed.
        const sockets: WebSocket[] = ((window as never as { __fillers: WebSocket[] }).__fillers = []);

        for (let seat = 1; seat < seats; seat++) {
          const participantId = crypto.randomUUID();

          // The relay identifies a socket by its directory membership, so a filler joins first and
          // then connects as itself — role and slot are the directory's to decide.
          const joinResponse = await fetch(`/online/room/${roomCode}/join`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ participantId, sessionId: participantId }),
          });
          const join = (await joinResponse.json()) as { ok: boolean; reason?: string };
          if (!join.ok) throw new Error(`Filler ${seat} could not claim a seat: ${join.reason}`);

          // The end-to-end suite runs on the relay data plane — there is no Realtime app to talk
          // to in CI — so a filler speaks the same relay protocol the client does.
          const relay = new URL(`/online/room/${roomCode}/relay`, location.href);
          relay.protocol = relay.protocol === 'https:' ? 'wss:' : 'ws:';
          relay.searchParams.set('participantId', participantId);
          relay.searchParams.set('sessionId', participantId);

          const socket = new WebSocket(relay.toString());
          sockets.push(socket);

          await new Promise<void>((resolve, reject) => {
            const timer = setTimeout(() => reject(new Error(`Filler socket ${seat} timed out joining`)), 10_000);
            const settle = (error?: Error) => {
              clearTimeout(timer);
              error ? reject(error) : resolve();
            };
            socket.addEventListener('open', () => {
              socket.send(JSON.stringify({ t: 'hello', participantId, name: `Filler ${seat}`, create: false }));
            });
            socket.addEventListener('message', (event: MessageEvent<string>) => {
              const message = JSON.parse(event.data);
              if (message.t === 'joined') settle();
              if (message.t === 'join-rejected') settle(new Error(`Filler ${seat} rejected: ${message.reason}`));
            });
            socket.addEventListener('error', () => settle(new Error(`Filler socket ${seat} failed to join`)));
            socket.addEventListener('close', () => settle(new Error(`Filler socket ${seat} closed before joining`)));
          });
        }
      },
      { roomCode, seats: ONLINE_MAX_PLAYERS },
    );

    return context;
  } catch (error) {
    // The caller has no handle on the seats already taken, so a failed setup cleans up after
    // itself rather than leaving the room full for the rest of the run.
    await context.close();
    throw error;
  }
}
