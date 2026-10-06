import { pack as msgpackrPack, unpack as msgpackrUnpack } from 'msgpackr';

import { SfuFrameCodec } from '~/modules/network/realtime/sfu-room-connection';
import { NetworkMessages } from '~/modules/remote-mic/network/messages';

/**
 * Remote mics over the Cloudflare Realtime SFU — the same wiring online mode uses (see
 * docs/online-mode.md): the game publishes a broadcast channel and a slot channel per phone, each
 * phone subscribes to the broadcast and replies on its own slot. Unlike an online room, the game is
 * always the host; the directory never hands the role to a phone.
 *
 * These frames exist only between the two transports and never reach `NetworkClient` or
 * `NetworkServer`.
 */
export type RealtimeControlMessage =
  /** Phone → game, first thing up a slot: who is on it. The SFU tells the game the slot, not the sender. */
  | { t: 'rt-hello'; id: string }
  /** Game → every phone over the broadcast. Silence is how a phone notices the game has gone. */
  | { t: 'rt-hb' }
  /** Game → phone: the connection is being closed on purpose, with the reason the phone acts on. */
  | { t: 'rt-close'; reason: string };

export type RealtimeFrame = NetworkMessages | RealtimeControlMessage;

export const isRealtimeControlMessage = (frame: RealtimeFrame): frame is RealtimeControlMessage =>
  frame.t === 'rt-hello' || frame.t === 'rt-hb' || frame.t === 'rt-close';

export const REALTIME_HEARTBEAT_MS = 2_000;

/** How long a phone hears nothing from the game before it treats it as gone and reconnects. Several
 * heartbeats, so one late frame is not a reconnect. */
export const REALTIME_HOST_SILENCE_MS = 10_000;

export const msgpackCodec: SfuFrameCodec<RealtimeFrame> = {
  encode: (message) => {
    const bytes = msgpackrPack(message);
    return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
  },
  decode: (frame) => msgpackrUnpack(new Uint8Array(frame as ArrayBuffer)),
};
