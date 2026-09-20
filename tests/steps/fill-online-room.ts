import { Browser, BrowserContext, test } from '@playwright/test';

import { ONLINE_MAX_PLAYERS } from '~/modules/players/player-number';

/**
 * Occupies every seat but the host's, at the protocol level.
 *
 * Five real guest tabs each holding a live fake-audio capture reliably deadlocks Chromium's
 * fake-audio backend, so the seats are filled the way the client fills them — open an SFU session,
 * claim a slot in the room directory, open that slot's pipe, say hello — without the game running
 * around them. Only the final, rejected join goes through the real UI, which is the part under test.
 *
 * The work happens inside a page rather than in the test process. The app's origin is only
 * reliably reachable from a browser: in the CI container `vite preview` binds a localhost that
 * Node's `fetch` resolves to an address nothing is listening on, so the same requests that a page
 * makes happily fail from the runner with ECONNREFUSED.
 *
 * Returns the context holding the connections; closing it frees the seats.
 */
export async function fillOnlineRoom(browser: Browser, roomCode: string): Promise<BrowserContext> {
  const context = await browser.newContext({ baseURL: test.info().project.use.baseURL });
  try {
    const page = await context.newPage();
    // Any page on the app's origin will do — it is only here to make the requests same-origin.
    await page.goto('/online/?e2e-test');

    await page.evaluate(
      async ({ roomCode, seats }) => {
        // Parked on `window` so the connections outlive this call and keep their seats claimed.
        const connections: RTCPeerConnection[] = ((window as never as { __fillers: RTCPeerConnection[] }).__fillers =
          []);

        const post = async <T>(path: string, body: unknown): Promise<T> => {
          const response = await fetch(path, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
          });
          if (!response.ok) throw new Error(`${path} failed: ${response.status} ${await response.text()}`);
          return response.json() as Promise<T>;
        };

        const until = (what: string, done: (settle: (error?: Error) => void) => void) =>
          new Promise<void>((resolve, reject) => {
            const timer = setTimeout(() => reject(new Error(`${what} timed out`)), 10_000);
            done((error) => {
              clearTimeout(timer);
              error ? reject(error) : resolve();
            });
          });

        for (let seat = 1; seat < seats; seat++) {
          const participantId = crypto.randomUUID();

          // The same handshake SfuSession runs: the SFU offers, this page answers.
          const { sessionId, offer, answerToken } = await post<{
            sessionId: string;
            offer: RTCSessionDescriptionInit;
            answerToken: string;
          }>('/online/session', {});
          const peerConnection = new RTCPeerConnection({ bundlePolicy: 'max-bundle' });
          connections.push(peerConnection);
          await peerConnection.setRemoteDescription(offer);
          await peerConnection.setLocalDescription(await peerConnection.createAnswer());
          await post('/online/session/answer', {
            sessionId,
            answer: { type: 'answer', sdp: peerConnection.localDescription!.sdp },
            answerToken,
          });
          await until(`Filler ${seat} transport`, (settle) => {
            const check = () => {
              if (peerConnection.connectionState === 'connected') settle();
              if (peerConnection.connectionState === 'failed') settle(new Error(`Filler ${seat} transport failed`));
            };
            peerConnection.addEventListener('connectionstatechange', check);
            check();
          });

          // Role and slot are the directory's to decide.
          const join = await post<{ ok: boolean; reason?: string; hostSessionId: string; slot: number }>(
            `/online/room/${roomCode}/join`,
            { participantId, sessionId },
          );
          if (!join.ok) throw new Error(`Filler ${seat} could not claim a seat: ${join.reason}`);

          const slotName = `slot-${join.slot}`;
          const { channels } = await post<{ channels: Array<{ name: string; id: number }> }>('/online/datachannels', {
            roomCode,
            participantId,
            sessionId,
            channels: [
              { name: 'room', publisherSessionId: join.hostSessionId },
              { name: slotName, publisherSessionId: join.hostSessionId, canReply: true },
            ],
          });
          const opened = channels.map(({ name, id }) =>
            peerConnection.createDataChannel(name, { negotiated: true, id }),
          );
          const slot = opened.find((channel) => channel.label === slotName)!;

          await until(`Filler ${seat} joining`, (settle) => {
            slot.addEventListener('open', () => {
              slot.send(JSON.stringify({ t: 'hello', participantId, name: `Filler ${seat}`, create: false }));
            });
            slot.addEventListener('message', (event: MessageEvent<string>) => {
              const message = JSON.parse(event.data);
              if (message.t === 'joined') settle();
              if (message.t === 'join-rejected') settle(new Error(`Filler ${seat} rejected: ${message.reason}`));
            });
            slot.addEventListener('close', () => settle(new Error(`Filler ${seat} slot closed before joining`)));
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
