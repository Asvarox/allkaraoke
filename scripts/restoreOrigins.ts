import { readdirSync, readFileSync, writeFileSync } from 'fs';
import { Song } from 'interfaces';
import convertSongToTxt from '../src/modules/Songs/utils/convertSongToTxt';
import convertTxtToSong from '../src/modules/Songs/utils/convertTxtToSong';
// @ts-ignore
import scrapedBpmData from './bandOrigins.json';
// @ts-ignore

const SONGS_FOLDER = './public/songs';

// const origins: Record<string, string> = {};

(async function () {
  const songs = readdirSync(SONGS_FOLDER);

  for (const file of songs) {
    if (!file.endsWith('.txt')) continue;
    console.log('reading', file);

    let song: Song = convertTxtToSong(readFileSync(`${SONGS_FOLDER}/${file}`, { encoding: 'utf-8' }));

    song.artistOrigin = (scrapedBpmData as Record<string, string>)[song.id];
    writeFileSync(`${SONGS_FOLDER}/${song.id}.txt`, convertSongToTxt(song), {
      encoding: 'utf-8',
    });
  }
})();

// writeFileSync('./scripts/bandOrigins.json', JSON.stringify(origins, null, 2), 'utf-8');
