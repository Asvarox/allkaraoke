import { readdirSync, readFileSync, writeFileSync } from 'fs';
import { Song } from '../src/interfaces';
import convertTxtToSong from '../src/Songs/utils/convertTxtToSong';
// @ts-ignore
// @ts-ignore

const SONGS_FOLDER = './public/songs';

const origins: Record<string, string> = {};

(async function () {
  const songs = readdirSync(SONGS_FOLDER);

  for (const file of songs) {
    if (!file.endsWith('.txt')) continue;
    console.log('reading', file);

    let song: Song = convertTxtToSong(readFileSync(`${SONGS_FOLDER}/${file}`, { encoding: 'utf-8' }));

    if (song.artistOrigin) {
      origins[song.id] = song.artistOrigin;
    }
  }
})();

writeFileSync('./scripts/bandOrigins.json', JSON.stringify(origins, null, 2), 'utf-8');
