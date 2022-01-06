import { Song, SongPreview } from './interfaces';
import { readdirSync, readFileSync } from 'fs';

const SONGS_FOLDER = './public/songs';

const list: SongPreview[] = [];

readdirSync(SONGS_FOLDER).forEach((file) => {
    if (file === 'index.json') return;

    const { tracks, ...songData }: Song = JSON.parse(readFileSync(`${SONGS_FOLDER}/${file}`, { encoding: 'utf-8' }));

    list.push({ ...songData, file });
});

console.log(JSON.stringify(list, undefined, 2));
