// Relative import on purpose: the Worker build shares this file and has no `~` alias
import { RealtimeService } from '../../network/realtime/protocol';

/**
 * Game codes are letters only, so they never clash with online room codes (which lead with a digit).
 * The game is always the host of its room and the phones are its members, so a remote-mic room never
 * hands the host role to anybody else.
 */
export const REMOTE_MIC_ROOM_CODE_PATTERN = /^[a-z]{5}$/;

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
