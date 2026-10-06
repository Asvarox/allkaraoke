import { RealtimeService } from '~/modules/network/realtime/protocol';
import storage from '~/modules/utils/storage';

/**
 * The secret the room directory mints for this browser's membership of a room.
 *
 * A participant id is published to the whole room in `room-state`, so it proves nothing — the
 * directory hands out a secret on the first join and wants it back on anything that acts on that
 * membership afterwards (rejoining it, claiming the host role with it).
 *
 * Kept in `localStorage` alongside the participant id and for the same reason: the game is not a
 * single-page app, so a room outlives several page loads, and a singer who closes the tab and comes
 * back is the same member as far as the directory is concerned. A secret in `sessionStorage` would
 * be gone exactly when it is needed. Scoped per feature and room code so leaving one room cannot
 * strand a membership of another.
 */
const key = (service: RealtimeService, roomCode: string) => `${service.storageKey}_MEMBERSHIP_SECRET_${roomCode}`;

export const getMembershipSecret = (service: RealtimeService, roomCode: string): string | undefined =>
  storage.getItem<string>(key(service, roomCode)) ?? undefined;

export const setMembershipSecret = (service: RealtimeService, roomCode: string, secret: string) => {
  storage.setItem(key(service, roomCode), secret);
};

export const clearMembershipSecret = (service: RealtimeService, roomCode: string) => {
  storage.removeItem(key(service, roomCode));
};
