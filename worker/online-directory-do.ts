// Relative import on purpose: the `~` alias is only configured for the app build, not the Worker one
import { ONLINE_SLOT_COUNT } from '../src/modules/online/signaling/protocol';
import { RoomDirectory } from './realtime/room-directory';

/** Online mode's rooms. The authority runs in a singer's browser, so when that singer goes quiet the
 * next one in line takes over (see docs/online-mode.md). */
export class OnlineDirectory extends RoomDirectory {
  protected readonly slotCount = ONLINE_SLOT_COUNT;
  protected readonly hasSuccession = true;
}
