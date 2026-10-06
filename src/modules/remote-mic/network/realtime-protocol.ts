// Relative import on purpose: the Worker build shares this file and has no `~` alias
import { RealtimeService } from '../../network/realtime/protocol';

/**
 * A game code's lead letter names its transport (`k` PartyKit, `w` WebSockets); `r` is the Realtime
 * one. The game is always the host of its room and the phones are its members, so a remote-mic room
 * never hands the host role to anybody else.
 */
export const REMOTE_MIC_ROOM_CODE_LEAD = 'r';
export const REMOTE_MIC_ROOM_CODE_PATTERN = /^r[a-z]{4}$/;

/** Phones a game can hold at once. More than the four singers: phones also join as remote
 * keyboards and song lists, and the host publishes every slot up front. */
export const REMOTE_MIC_SLOT_COUNT = 16;

export const REMOTE_MIC_REALTIME: RealtimeService = {
  // Not `/remote-mic`: that is the phone's page
  basePath: '/remote-mic-signaling',
  slotCount: REMOTE_MIC_SLOT_COUNT,
  roomCodePattern: REMOTE_MIC_ROOM_CODE_PATTERN,
  storageKey: 'REMOTE_MIC',
};
