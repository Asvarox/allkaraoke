import { readFileSync, writeFileSync } from 'fs';
import * as process from 'process';
import convertSongToTxt from '../src/Songs/utils/convertSongToTxt';
import convertTxtToSong from '../src/Songs/utils/convertTxtToSong';

const files = process.argv.slice(2);

console.log(files);
files.forEach((file) => {
  if (!file.endsWith('.txt')) return;

  const updateDate = new Date().toISOString();
  const contents = readFileSync(file, 'utf-8');
  const data = convertTxtToSong(contents);
  data.lastUpdate = updateDate;
  writeFileSync(file, convertSongToTxt(data), 'utf-8');
});
