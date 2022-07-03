import { readdirSync, readFileSync } from 'fs';
import { Song, SongPreview } from 'interfaces';
import clearString from '../src/utils/clearString';

const SONGS_FOLDER = './public/songs';

const list: SongPreview[] = [];

const generateSearchString = (song: Pick<Song, 'title' | 'artist'>) => clearString(`${song.artist}${song.title}`);

readdirSync(SONGS_FOLDER).forEach((file) => {
    if (file === 'index.json' || file === 'dummy.json' || !file.endsWith('.json')) return;

    const { tracks, ...songData }: Song = JSON.parse(readFileSync(`${SONGS_FOLDER}/${file}`, { encoding: 'utf-8' }));

    list.push({
        ...songData,
        file,
        tracksCount: tracks.length,
        tracks: tracks.map(({ name }) => ({ name })),
        search: generateSearchString(songData),
    });
});

console.log(JSON.stringify(list, undefined, 2));
