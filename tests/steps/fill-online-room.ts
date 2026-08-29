import { test } from '@playwright/test';

import { ONLINE_MAX_PLAYERS } from '~/modules/players/player-number';

/**
 * Occupies every seat but the host's, at the protocol level.
 *
 * Five real guest tabs each holding a live fake-audio capture reliably deadlocks Chromium's
 * fake-audio backend, so the seats are filled the way the client fills them — claim a slot in the
 * room directory, open that slot's pipe, say hello — without a browser tab around it. Only the
 * final, rejected join goes through the real UI, which is the part under test.
 */
export async function fillOnlineRoom(roomCode: string): Promise<WebSocket[]> {
  const baseURL = test.info().project.use.baseURL!;
  const origin = new URL(baseURL).origin;
  const sockets: WebSocket[] = [];

  try {
    return await openFillerSockets(roomCode, origin, sockets);
  } catch (error) {
    // The caller only gets the rejection, so it has no handle on the seats already taken — closing
    // them here keeps a failed setup from leaving a room permanently full for the rest of the run.
    sockets.forEach((socket) => socket.close());
    throw error;
  }
}

async function openFillerSockets(roomCode: string, origin: string, sockets: WebSocket[]): Promise<WebSocket[]> {
  for (let seat = 1; seat < ONLINE_MAX_PLAYERS; seat++) {
    const participantId = crypto.randomUUID();

    const joinResponse = await fetch(`${origin}/online/room/${roomCode}/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ participantId, sessionId: participantId }),
    });
    const join = (await joinResponse.json()) as { ok: boolean; slot?: number; reason?: string };
    if (!join.ok) throw new Error(`Filler ${seat} could not claim a seat: ${join.reason}`);

    // The end-to-end suite runs on the relay data plane — there is no Realtime app to talk to in
    // CI — so a filler speaks the same relay protocol the client does.
    const socket = new WebSocket(
      `${origin.replace(/^http/, 'ws')}/online/room/${roomCode}/relay?role=client&slot=${join.slot}`,
    );
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
      socket.addEventListener('message', (event) => {
        const message = JSON.parse(event.data.toString());
        if (message.t === 'joined') settle();
        if (message.t === 'join-rejected') settle(new Error(`Filler ${seat} rejected: ${message.reason}`));
      });
      socket.addEventListener('error', () => settle(new Error(`Filler socket ${seat} failed to join`)));
      socket.addEventListener('close', () => settle(new Error(`Filler socket ${seat} closed before joining`)));
    });
  }

  return sockets;
}
