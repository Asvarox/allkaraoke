// Relative import on purpose: the Worker build shares this file and has no `~` alias
import { RealtimeService } from '../../network/realtime/protocol';

/** Rooms are capped at ONLINE_MAX_PLAYERS, so the host can publish every slot channel up front
 * and never renegotiate when somebody joins. Kept in sync with `ONLINE_MAX_PLAYERS` by a test —
 * it cannot be imported here without dragging the app's `~` alias into the Worker build. */
export const ONLINE_SLOT_COUNT = 6;

/**
 * The first character of a room code: a digit, left over from when the all-letter codes belonged to
 * the PartyKit room server this one replaced. 0 and 1 are left out — they read as O and l, and the
 * code is read out across a room and typed on phones.
 */
export const P2P_ROOM_CODE_LEADS = '23456789';

/** A room code in full: a lead digit and four lowercase letters, five characters like every room
 * code (`ONLINE_ROOM_CODE_LENGTH`, kept in sync by a test). The Worker holds its directory to this. */
export const P2P_ROOM_CODE_PATTERN = /^[2-9][a-z]{4}$/;

export const ONLINE_REALTIME: RealtimeService = {
  basePath: '/online',
  slotCount: ONLINE_SLOT_COUNT,
  roomCodePattern: P2P_ROOM_CODE_PATTERN,
  storageKey: 'ONLINE',
};
