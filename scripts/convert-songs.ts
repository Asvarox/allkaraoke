import { readdirSync, readFileSync, writeFileSync } from 'fs';
import convertSongToTxt from '../src/modules/Songs/utils/convertSongToTxt';

const songs = readdirSync('./tests/fixtures/songs/')
  .filter((file) => file.endsWith('.json'))
  .map((file) => ({
    song: JSON.parse(readFileSync(`./tests/fixtures/songs/${file}`, { encoding: 'utf-8' })),
  }));

for (const song of songs) {
  writeFileSync(`./tests/fixtures/songs/${song.song.id}.txt`, convertSongToTxt(song.song), { encoding: 'utf-8' });
}
