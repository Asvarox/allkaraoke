import convertTxtToSong from 'Songs/utils/convertTxtToSong';
import getSongId from 'Songs/utils/getSongId';
import { lastVisit } from 'Stats/lastVisit';
import { isAfter } from 'date-fns';
import { Song, SongPreview } from 'interfaces';
import localForage from 'localforage';
import { getSongPreview } from './utils';

const storage = localForage.createInstance({
    name: 'songs_v2',
});

const DELETED_SONGS_KEY = 'DELETED_SONGS_V2';

class SongDao {
    private finalIndex: SongPreview[] | null = null;
    private indexWithDeletedSongs: SongPreview[] | null = null;
    public store = async (song: Song) => {
        await storage.setItem(this.generateSongFile(song), { ...song, lastUpdate: new Date().toISOString() });
        await this.reloadIndex();
    };

    public get = async (songId: string) => {
        const localSong = await this.getLocal(songId);

        if (!localSong) {
            return await fetch(`./songs/${songId}.txt`)
                .then((response) => response.text())
                .then(convertTxtToSong);
        }

        return localSong;
    };

    public getIndex = async (includeDeleted = false): Promise<SongPreview[]> => {
        if (this.finalIndex === null) {
            await this.reloadIndex();
        }

        return includeDeleted ? this.indexWithDeletedSongs! : this.finalIndex!;
    };

    public getCurrentIndex = () => this.finalIndex;

    public getDeletedSongsList = async () => {
        const list = await storage.getItem<string[]>(DELETED_SONGS_KEY);

        return list ?? [];
    };

    public generateSongFile = (song: Pick<Song | SongPreview, 'artist' | 'title'> & { id?: string }) => getSongId(song);

    public reloadIndex = async () => {
        const [defaultIndex, storageIndex, deletedSongs] = await Promise.all([
            fetch('./songs/index.json').then((response) => response.json() as Promise<SongPreview[]>),
            this.getLocalIndex(),
            this.getDeletedSongsList(),
        ]);
        const lastVisitDate = new Date(lastVisit);

        const localSongs = storageIndex.map((song) => song.id);

        this.indexWithDeletedSongs = [
            ...storageIndex,
            ...defaultIndex.filter((song) => !localSongs.includes(this.generateSongFile(song))),
        ].map((song) => ({
            ...song,
            isNew: song.lastUpdate ? isAfter(new Date(song.lastUpdate), lastVisitDate) : false,
            isDeleted: deletedSongs?.includes(this.generateSongFile(song)),
        }));

        this.indexWithDeletedSongs.sort((a, b) =>
            `${a.artist} ${a.title}`.localeCompare(`${b.artist} ${b.title}`.toLowerCase()),
        );

        this.finalIndex = this.indexWithDeletedSongs.filter((song) => !song.isDeleted);
    };

    public deleteSong = async (songId: string) => {
        await storage.removeItem(songId);

        return this.reloadIndex();
    };

    public softDeleteSong = async (songId: string) => {
        const deletedItems = await this.getDeletedSongsList();
        await storage.setItem(DELETED_SONGS_KEY, [...new Set([...deletedItems, songId])]);
        return this.reloadIndex();
    };
    public restoreSong = async (songId: string) => {
        const deletedItems = await this.getDeletedSongsList();
        await storage.setItem(
            DELETED_SONGS_KEY,
            deletedItems.filter((item) => item !== songId),
        );
        return this.reloadIndex();
    };

    private getLocal = async (songId: string) => storage.getItem<Song>(decodeURIComponent(songId));
    public getLocalIndex = async () => {
        const allSongs = await Promise.all((await this.getKeys()).map(this.getLocal));

        return allSongs.filter((song): song is Song => song !== null).map((song) => getSongPreview(song, true));
    };

    private getKeys = async () => {
        const specialKeys = [DELETED_SONGS_KEY];

        return (await storage.keys()).filter((key) => !specialKeys.includes(key));
    };
}

export default new SongDao();
