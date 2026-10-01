import { ONLINE_ROOM_CODE_LENGTH } from '~/modules/online/protocol/consts';
import { P2P_ROOM_CODE_LEADS } from '~/modules/online/signaling/protocol';
import generateRoomCode from '~/modules/utils/generate-room-code';

/** A fresh room code: a lead digit (`P2P_ROOM_CODE_LEADS`) and letters for the rest, which is the
 * only shape the Worker's room directory accepts. */
export const generateOnlineRoomCode = (): string => {
  const lead = P2P_ROOM_CODE_LEADS[Math.floor(Math.random() * P2P_ROOM_CODE_LEADS.length)];
  return `${lead}${generateRoomCode(ONLINE_ROOM_CODE_LENGTH - 1)}`;
};
