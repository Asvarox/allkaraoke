import { uniq } from 'es-toolkit';
import events from '~/modules/game-events/game-events';
import Listener from '~/modules/utils/listener';

class RemoteMicSongList extends Listener<[string[]]> {
  private lists: Record<string, string[]> = {};
  constructor() {
    super();
    events.remoteMicSongListUpdated.subscribe(this.updateList);
    events.remoteMicDisconnected.subscribe((remoteMic) => {
      delete this.lists[remoteMic.id];
      this.onUpdate(this.getSongList());
    });
  }

  private updateList = (from: string, delta: { added?: string[]; deleted?: string[] }) => {
    if (!this.lists[from]) {
      this.lists[from] = [];
    }
    if (delta.added) {
      this.lists[from] = uniq(this.lists[from].concat(delta.added));
    }
    if (delta.deleted) {
      this.lists[from] = this.lists[from].filter((song) => !delta.deleted?.includes(song));
    }
    this.onUpdate(this.getSongList());
  };

  public getSongList = () => uniq(Object.values(this.lists).flat());
}

export default new RemoteMicSongList();
