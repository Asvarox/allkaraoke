import { OnlineRoomConnection } from '~/modules/online/client/transport/interface';
import { RelayRoomConnection } from '~/modules/online/client/transport/relay-room-connection';
import { SfuRoomConnection } from '~/modules/online/client/transport/sfu-room-connection';
import { fetchRoomInfo } from '~/modules/online/signaling/directory-client';

/**
 * Picks the wire a room's messages travel on, asking the Worker rather than guessing: it is the
 * only side that knows whether a Cloudflare Realtime app is configured. Production always answers
 * `sfu`; the end-to-end suite and a credential-less local checkout get the Durable Object relay.
 *
 * Falling back on a failed lookup would be wrong in the expensive direction — an unreachable
 * Worker would silently put every room back on the relay — so the SFU is the default.
 */
export const createRoomConnection = async (roomCode: string, participantId: string): Promise<OnlineRoomConnection> => {
  const info = await fetchRoomInfo(roomCode);
  return info?.dataPlane === 'relay'
    ? new RelayRoomConnection(roomCode, participantId)
    : new SfuRoomConnection(roomCode, participantId);
};
