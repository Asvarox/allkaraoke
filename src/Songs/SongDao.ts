import { Song, SongPreview } from 'interfaces';
import localForage from 'localforage';
import { getSongPreview } from '../../scripts/utils';

const storage = localForage.createInstance({
    name: 'songs',
});

const DELETED_SONGS_KEY = 'DELETED_SONGS';
const SONGS_KEY = 'STORED_SONGS';

class SongDao {
    private index: SongPreview[] | null = null;
    public store = async (song: Song) => {
        await storage.setItem(this.generateSongFile(song), { ...song, lastUpdate: new Date().toISOString() });
        await this.reloadIndex();
    };

    public get = async (fileName: string) => {
        const localSong = await this.getLocal(fileName);

        if (!localSong) {
            return await fetch(`./songs/${fileName}`).then((response) => response.json());
        }

        return localSong;
    };

    public getIndex = async (): Promise<SongPreview[]> => {
        if (this.index === null) {
            await this.reloadIndex();
        }

        return this.index!;
    };

    public generateSongFile = (song: Song | SongPreview) => `${song?.artist}-${song?.title}.json`;

    public reloadIndex = async () => {
        const [defaultIndex, storageIndex, deletedSongs] = await Promise.all([
            fetch('./songs/index.json').then((response) => response.json() as Promise<SongPreview[]>),
            this.getLocalIndex(),
            storage.getItem<string[]>(DELETED_SONGS_KEY),
        ]);

        const localSongs = storageIndex.map((song) => song.file);

        this.index = [
            ...storageIndex,
            ...defaultIndex.filter((song) => !localSongs.includes(this.generateSongFile(song))),
        ].filter((song) => !(deletedSongs ?? []).includes(this.generateSongFile(song)));

        this.index.sort((a, b) => `${a.artist} ${a.title}`.localeCompare(`${b.artist} ${b.title}`.toLowerCase()));
    };

    public softDeleteSong = async (fileName: string) => {
        const deletedItems = (await storage.getItem<string[]>(DELETED_SONGS_KEY)) ?? [];
        await storage.setItem(DELETED_SONGS_KEY, [...new Set([...deletedItems, fileName])]);
        return this.reloadIndex();
    };

    private getLocal = async (fileName: string) => storage.getItem<Song>(fileName);
    private getLocalIndex = async () => {
        const allSongs = await Promise.all((await this.getKeys()).map(this.getLocal));

        return allSongs
            .filter((song): song is Song => song !== null)
            .map((song) => getSongPreview(this.generateSongFile(song), song));
    };

    private getKeys = async () => {
        const specialKeys = [DELETED_SONGS_KEY];

        return (await storage.keys()).filter((key) => !specialKeys.includes(key));
    };
}

export default new SongDao();
