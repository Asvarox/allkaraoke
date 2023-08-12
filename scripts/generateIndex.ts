import { readdirSync, readFileSync } from 'fs';
import { Song, SongPreview } from 'interfaces';
import { getSongPreview } from '../src/Songs/utils';
import convertTxtToSong from '../src/Songs/utils/convertTxtToSong';

const SONGS_FOLDER = './public/songs';

const list: SongPreview[] = [];

readdirSync(SONGS_FOLDER).forEach((file) => {
    if (!file.endsWith('.txt')) return;

    const songData: Song = convertTxtToSong(readFileSync(`${SONGS_FOLDER}/${file}`, { encoding: 'utf-8' }));

    list.push(getSongPreview(songData));
});

console.log(JSON.stringify(list, undefined, 2));
