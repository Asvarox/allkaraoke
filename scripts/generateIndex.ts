import { readdirSync, readFileSync } from 'fs';
import { Song, SongPreview } from 'interfaces';
import { getSongPreview } from '../src/Songs/utils';

const SONGS_FOLDER = './public/songs';

const list: SongPreview[] = [];

readdirSync(SONGS_FOLDER).forEach((file) => {
    if (file === 'index.json' || file === 'dummy.json' || !file.endsWith('.json')) return;

    const songData: Song = JSON.parse(readFileSync(`${SONGS_FOLDER}/${file}`, { encoding: 'utf-8' }));

    list.push(getSongPreview(file, songData));
});

console.log(JSON.stringify(list, undefined, 2));
