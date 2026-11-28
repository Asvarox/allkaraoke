import { readdirSync, readFileSync, writeFileSync } from 'fs';

import convertSongToTxt from '../src/modules/songs/utils/convert-song-to-txt';
import convertTxtToSong from '../src/modules/songs/utils/convert-txt-to-song';
import {
  applyEscEditionFromTitle,
  normalizeLegacyMetadata,
} from '../src/modules/songs/utils/shared-song-import-processing';

const SONGS_FOLDER = './public/songs';

// Re-applies title suffix cleanup to existing songs. IDs are stored in the txt and are left untouched.
for (const file of readdirSync(SONGS_FOLDER)) {
  if (!file.endsWith('.txt')) continue;

  const path = `${SONGS_FOLDER}/${file}`;
  const song = convertTxtToSong(readFileSync(path, 'utf-8'));
  const { title, edition } = song;

  applyEscEditionFromTitle(song);
  normalizeLegacyMetadata(song);
  applyEscEditionFromTitle(song);

  if (song.title === title && song.edition === edition) continue;

  console.log(`${song.id}: "${title}" -> "${song.title}"${song.edition !== edition ? ` [${song.edition}]` : ''}`);
  writeFileSync(path, convertSongToTxt(song));
}
