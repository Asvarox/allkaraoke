import dotenv from 'dotenv';

import { regenerateUnverifiedSongIndex } from './unverified-songs-admin-client';

dotenv.config({ path: '.env' });
dotenv.config({ path: '.env.local', override: true });

(async () => {
  const [baseUrlArg] = process.argv.slice(2);

  process.env.UNVERIFIED_SONGS_ADMIN_URL = baseUrlArg ?? 'http://localhost:3000';

  regenerateUnverifiedSongIndex();
  console.log(`unverified songs index regeneration requested`);
})();
