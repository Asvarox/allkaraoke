import { readdirSync, readFileSync } from 'fs';
import { Song, SongPreview } from './interfaces';

const SONGS_FOLDER = './public/songs';

const list: SongPreview[] = [];

readdirSync(SONGS_FOLDER).forEach((file) => {
    if (file === 'index.json' || file === 'dummy.json') return;

    const { tracks, ...songData }: Song = JSON.parse(readFileSync(`${SONGS_FOLDER}/${file}`, { encoding: 'utf-8' }));

    list.push({ ...songData, file, tracksCount: tracks.length });
});

console.log(JSON.stringify(list, undefined, 2));
