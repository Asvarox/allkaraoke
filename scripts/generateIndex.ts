import fs, { readdirSync, readFileSync } from 'fs';
import { Song, SongPreview } from '~/interfaces';
import { getSongPreview } from '../src/modules/Songs/utils';
import convertTxtToSong from '../src/modules/Songs/utils/convertTxtToSong';

const SONGS_FOLDER = './public/songs';

const list: SongPreview[] = [];

readdirSync(SONGS_FOLDER).forEach((file) => {
  if (!file.endsWith('.txt')) return;

  const songData: Song = convertTxtToSong(readFileSync(`${SONGS_FOLDER}/${file}`, { encoding: 'utf-8' }));

  list.push(getSongPreview(songData));
});

fs.writeFileSync(`${SONGS_FOLDER}/index.json`, JSON.stringify(list, undefined, 2));
