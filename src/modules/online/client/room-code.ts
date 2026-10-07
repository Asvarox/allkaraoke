import { ONLINE_ROOM_CODE_LENGTH } from '~/modules/online/protocol/consts';
import { P2P_ROOM_CODE_LEADS, P2P_ROOM_CODE_PATTERN } from '~/modules/online/signaling/protocol';
import generateRoomCode from '~/modules/utils/generate-room-code';

/** A fresh room code: a lead digit (`P2P_ROOM_CODE_LEADS`) and letters for the rest, which is the
 * only shape the Worker's room directory accepts. */
export const generateOnlineRoomCode = (): string => {
  const lead = P2P_ROOM_CODE_LEADS[Math.floor(Math.random() * P2P_ROOM_CODE_LEADS.length)];
  return `${lead}${generateRoomCode(ONLINE_ROOM_CODE_LENGTH - 1)}`;
};

/** Whether a typed code is an online room code — its lead digit tells it apart from a remote-mic
 * game code, which always starts with its transport letter. */
export const isOnlineRoomCode = (code: string): boolean => P2P_ROOM_CODE_PATTERN.test(code.trim().toLowerCase());
