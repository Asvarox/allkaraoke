import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import convertTxtToSong from '../../src/modules/Songs/utils/convertTxtToSong';
import { upsertSharedSongRecord } from './sharedSongsAdminClient';

dotenv.config({ path: '.env' });
dotenv.config({ path: '.env.local', override: true });

const normalizeSongTxt = (songTxt: string) => songTxt.replaceAll('\r\n', '\n');

(async () => {
  const [fixturePathArg] = process.argv.slice(2);

  if (!fixturePathArg) {
    throw new Error('Missing fixture path argument');
  }

  const fixturePath = path.resolve(process.cwd(), fixturePathArg);
  if (!fs.existsSync(fixturePath)) {
    throw new Error(`Fixture file not found: ${fixturePath}`);
  }

  const songTxt = normalizeSongTxt(fs.readFileSync(fixturePath, 'utf-8'));
  const song = convertTxtToSong(songTxt);

  if (!song.id) {
    throw new Error('Fixture song is missing #ALLKARAOKE_ID');
  }

  const now = Date.now();
  await upsertSharedSongRecord({
    externalSongId: song.id,
    songId: song.id,
    songTxt,
    artist: song.artist,
    title: song.title,
    language: song.language,
    videoId: song.video,
    verifiedAt: now,
    firstSeenAt: now,
    lastSeenAt: now,
    sourceUserId: 'cloudflare-local-e2e',
    sourceEventAt: now,
  });

  console.log(`Upserted shared song fixture: ${song.id}`);
})();
