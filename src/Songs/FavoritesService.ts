import localForage from 'localforage';
import Listener from 'utils/Listener';
import tuple from 'utils/tuple';

const storage = localForage.createInstance({
  name: 'songs_favorites',
});

class FavoriteService extends Listener<[string, boolean]> {
  private state: Record<string, boolean | undefined> | null = null;

  public getAll = async () => {
    if (this.state === null) {
      await this.loadState();
    }

    return this.state!;
  };

  public isFavorite = (songId: string) => {
    return this.state?.[songId];
  };

  public setFavorite = async (songId: string, state: boolean) => {
    if (this.state === null) {
      await this.loadState();
    }

    await storage.setItem(songId, state);
    this.state![songId] = state;
    this.onUpdate(songId, state);
  };

  private loadState = async () => {
    this.state = (
      await Promise.all(
        (await storage.keys()).map((songId) =>
          storage.getItem<boolean>(songId).then((state) => tuple([songId, !!state])),
        ),
      )
    ).reduce(
      (acc, [songId, state]) => ({
        ...acc,
        [songId]: state,
      }),
      {},
    );
  };
}

export default new FavoriteService();
