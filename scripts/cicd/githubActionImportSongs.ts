import { execSync } from 'child_process';
import dotenv from 'dotenv';
import fs from 'fs';
import convertSongToTxt from '../../src/modules/Songs/utils/convertSongToTxt';
import convertTxtToSong from '../../src/modules/Songs/utils/convertTxtToSong';

dotenv.config({ path: '.env.local' });

(async () => {
  const { requestPostHog } = require('../utils.cjs');

  const [userId, argDaysFrom = '', argDaysTo = ''] = process.argv.slice(2);

  if (!userId) {
    throw new Error('Missing user ID');
  }

  const daysFrom = argDaysFrom !== '' ? +argDaysFrom : 2;
  if (isNaN(daysFrom)) {
    throw new Error(`Invalid day from: "${argDaysFrom}"`);
  }
  const daysTo = argDaysTo !== '' ? +argDaysTo : 0;
  if (isNaN(daysTo)) {
    throw new Error(`Invalid day to: "${argDaysTo}"`);
  }
  const dateFrom = new Date();
  dateFrom.setDate(dateFrom.getDate() - daysFrom);

  const dateTo = new Date();
  dateTo.setDate(dateTo.getDate() - daysTo);

  const response = await requestPostHog(`query`, {
    method: 'POST',
    body: JSON.stringify({
      query: {
        kind: 'HogQLQuery',
        query: `
            select events.properties.song, events.properties.songId, events.created_at
            from events
            where events.created_at > toDateTime('${dateFrom.toISOString()}')
              and events.created_at < toDateTime('${dateTo.toISOString()}')
              and events.properties.$user_id IN(${userId
                .split(',')
                .map((s) => `'${s.trim()}'`)
                .join(',')})
              and event IN ('share-song', 'unshare-song')
            ORDER BY events.created_at ASC
            LIMIT 500
        `,
      },
    }),
  });

  const addedSongs: string[] = [];

  response.results.forEach(([songTxt, songId]: [string, string]) => {
    try {
      if (!songTxt && songId && addedSongs.includes(songId)) {
        fs.rmSync(`./public/songs/${songId}.txt`);
        console.log(`Deleting song ${songId}`);
      }
      const song = convertTxtToSong(songTxt?.replaceAll('\\n', '\n'));
      if (!song.id) {
        console.log('Song has no ID', song, songId);
        return;
      }

      song.tracks.forEach((track) => {
        track.sections.forEach((section) => {
          if ('notes' in section) {
            section.notes.forEach((note) => {
              note.lyrics = note.lyrics?.replaceAll(/\\+"/g, '"');
            });
          }
        });
      });

      // keep old last update time if the song exists
      if (fs.existsSync(`./public/songs/${song.id}.txt`)) {
        const oldSong = convertTxtToSong(fs.readFileSync(`./public/songs/${song.id}.txt`, 'utf-8'));
        song.lastUpdate = oldSong.lastUpdate ?? song.lastUpdate;
      } else {
        addedSongs.push(song.id);
      }
      fs.writeFileSync(`./public/songs/${song.id}.txt`, convertSongToTxt(song));
      console.log(`Added/updated song ${song.id}`);
    } catch (e) {
      console.warn(`Couldn't convert song`, e, songTxt, songId);
    }
  });
  console.log('Updating song data');
  execSync(`pnpm ts-node scripts/updateLastUpdate.ts ${addedSongs.map((s) => `./public/songs/${s}.txt`).join(' ')}`);
  console.log('Updating song stats');
  execSync(`pnpm ts-node scripts/generateSongStats.ts`);
  require('../generateIndex');
})();
