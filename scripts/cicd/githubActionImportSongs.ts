import dotenv from 'dotenv';
import fs from 'fs';
import convertSongToTxt from '../../src/Songs/utils/convertSongToTxt';
import convertTxtToSong from '../../src/Songs/utils/convertTxtToSong';

dotenv.config({ path: '.env.local' });

(async () => {
  const { requestPostHog } = require('../utils.cjs');

  const [userId, argDateFrom = '', argDateTo = ''] = process.argv.slice(2);

  if (!userId) {
    throw new Error('Missing user ID');
  }

  let dateFrom = argDateFrom !== '' ? new Date(argDateFrom) : undefined;
  if (dateFrom === undefined) {
    dateFrom = new Date();
    dateFrom.setDate(dateFrom.getDate() - 1);
  } else if (isNaN(dateFrom.getTime())) {
    throw new Error(`Invalid date from: "${argDateFrom}"`);
  }
  let dateTo = argDateTo !== '' ? new Date(argDateTo) : new Date();
  if (isNaN(dateTo.getTime())) {
    throw new Error(`Invalid date to: "${argDateTo}"`);
  }

  const response = await requestPostHog(`query`, {
    method: 'POST',
    body: JSON.stringify({
      query: {
        kind: 'HogQLQuery',
        query: `
            select events.properties.song
            from events
            where events.created_at > toDateTime('${dateFrom.toISOString()}')
              and events.created_at < toDateTime('${dateTo.toISOString()}')
              and events.properties.$user_id = '${userId}'
              and event IN ('share-song')
        `,
      },
    }),
  });

  response.results.forEach(([songTxt]: [string]) => {
    try {
      let song = convertTxtToSong(songTxt.replaceAll('\\n', '\n'));
      if (!song.id) {
        console.log('Song has no ID', song);
        return;
      }
      fs.writeFileSync(`./public/songs/${song.id}.txt`, convertSongToTxt(song));
      console.log(`Added/updated song ${song.id}`);
    } catch (e) {
      console.warn(`Couldn't convert song`, e, songTxt);
    }
  });
  require('../generateIndex');
})();
