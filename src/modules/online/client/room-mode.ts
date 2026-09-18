import { ONLINE_ROOM_CODE_LENGTH } from '~/modules/online/protocol/consts';
import { P2P_ROOM_CODE_LEADS } from '~/modules/online/signaling/protocol';
import generateRoomCode from '~/modules/utils/generate-room-code';

/**
 * Where a room's authority lives.
 *
 * `server` is the original design: `OnlineRoomLogic` in the PartyKit room, every client on a
 * socket to it. `p2p` runs the same logic in the host's browser and moves messages over the
 * Cloudflare Realtime SFU, which is billed on egress instead of by the second — hence the
 * `OnlineP2P` flag, so it can be rolled out gradually and turned off in one click.
 *
 * A room's mode is written into its code (see `P2P_ROOM_CODE_LEADS`) and read back from it with
 * `roomModeOf`. The flag only ever decides what kind of code a *new* room gets.
 */
export type OnlineRoomMode = 'server' | 'p2p';

/** The mode a room runs in, read off its code. Everyone in a room has to agree on this, and the code
 * is the one thing they all have — typed in, from an invite link, or remembered across a reload. */
export const roomModeOf = (roomCode: string): OnlineRoomMode =>
  P2P_ROOM_CODE_LEADS.includes(roomCode.charAt(0)) ? 'p2p' : 'server';

/** A fresh code for a room opened in `mode`. Server codes are the same all-letter codes they have
 * always been; P2P codes swap the first letter for a lead digit, keeping the length every code
 * shares. */
export const generateOnlineRoomCode = (mode: OnlineRoomMode): string => {
  if (mode === 'server') return generateRoomCode(ONLINE_ROOM_CODE_LENGTH);
  const lead = P2P_ROOM_CODE_LEADS[Math.floor(Math.random() * P2P_ROOM_CODE_LEADS.length)];
  return `${lead}${generateRoomCode(ONLINE_ROOM_CODE_LENGTH - 1)}`;
};
