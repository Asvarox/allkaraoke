// Relative import on purpose: the `~` alias is only configured for the app build, not the Worker one
import { REMOTE_MIC_SLOT_COUNT } from '../src/modules/remote-mic/network/realtime-protocol';
import { RoomDirectory } from './realtime/room-directory';

/** Remote mics' rooms, one per Realtime game code. The game is the room: a phone holding the host
 * role would leave every other phone subscribed to a game that is not there, so it never moves. */
export class RemoteMicDirectory extends RoomDirectory {
  protected readonly slotCount = REMOTE_MIC_SLOT_COUNT;
  protected readonly hasSuccession = false;
}
