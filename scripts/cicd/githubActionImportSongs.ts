import dotenv from 'dotenv';
import fs from 'fs';
import convertSongToTxt from '../../src/modules/Songs/utils/convertSongToTxt';
import convertTxtToSong from '../../src/modules/Songs/utils/convertTxtToSong';

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
    dateFrom.setDate(dateFrom.getDate() - 2);
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
              and events.properties.$user_id IN('${userId
                .split(',')
                .map((s) => s.trim())
                .join("','")}')
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
      // keep old last update time if the song exists
      if (fs.existsSync(`./public/songs/${song.id}.txt`)) {
        const oldSong = convertTxtToSong(fs.readFileSync(`./public/songs/${song.id}.txt`, 'utf-8'));
        song.lastUpdate = oldSong.lastUpdate ?? song.lastUpdate;
      }
      fs.writeFileSync(`./public/songs/${song.id}.txt`, convertSongToTxt(song));
      console.log(`Added/updated song ${song.id}`);
    } catch (e) {
      console.warn(`Couldn't convert song`, e, songTxt);
    }
  });
  require('../generateIndex');
})();
