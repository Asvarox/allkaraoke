import dotenv from 'dotenv';
import { regenerateSharedSongIndex } from './shared-songs-admin-client';

dotenv.config({ path: '.env' });
dotenv.config({ path: '.env.local', override: true });

(async () => {
  const [baseUrlArg] = process.argv.slice(2);

  process.env.SHARED_SONGS_ADMIN_URL = baseUrlArg ?? 'https://localhost:3000';

  regenerateSharedSongIndex();
  console.log(`shared songs index regeneration requested`);
})();
