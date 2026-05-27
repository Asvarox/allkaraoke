import { execSync } from 'child_process';
import dotenv from 'dotenv';
import fs from 'fs';
import currentSongs from '../../public/songs/index.json';
import convertSongToTxt from '../../src/modules/Songs/utils/convertSongToTxt';
import convertTxtToSong from '../../src/modules/Songs/utils/convertTxtToSong';
import { createYoutubeDurationProbeClient, type YoutubeDurationProbeClient } from '../youtubeDurationClient';
import { isSharedSongsAdminConfigured, removeSharedSongRecord } from './sharedSongsAdminClient';

dotenv.config({ path: '.env.local' });

(async () => {
  let maxId = currentSongs.reduce((acc, song) => Math.max(acc, song.shortId ?? 0), 0);
  let durationProbeClient: YoutubeDurationProbeClient | null = null;

  const { requestPostHog } = require('../utils.cjs');

  const [userId, argDaysFrom = '', argDaysTo = ''] = process.argv.slice(2);

  if (!userId) {
    throw new Error('Missing user ID');
  }

  const daysFrom = argDaysFrom !== '' ? +argDaysFrom : 4;
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

  const userIds = userId.split(',').map((s) => s.trim());
  const invalidUserId = userIds.find((id) => !/^[a-zA-Z0-9@._:-]+$/.test(id));
  if (invalidUserId) {
    throw new Error(`Invalid user ID: ${invalidUserId}`);
  }

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
              and events.properties.$user_id IN(${userIds.map((id) => `'${id}'`).join(',')})
              and event IN ('share-song', 'unshare-song')
            ORDER BY events.created_at ASC
            LIMIT 500
        `,
      },
    }),
  });

  const addedSongs: string[] = [];
  const promotedSongs = new Set<string>();

  try {
    for (const [songTxt, songId] of response.results as [string, string][]) {
      try {
        if (!songTxt && songId) {
          if (addedSongs.includes(songId)) {
            fs.rmSync(`./public/songs/${songId}.txt`, { force: true });
            console.log(`Deleting song ${songId}`);
          } else {
            console.log(`Song ${songId} marked as deleted, but not found in added songs, leaving as is`);
          }
          continue;
        }

        const song = convertTxtToSong(songTxt?.replaceAll('\\n', '\n'));
        if (!song.id) {
          console.log('Song has no ID', song, songId);
          continue;
        }

        promotedSongs.add(song.id);

        song.tracks.forEach((track) => {
          track.sections.forEach((section) => {
            if ('notes' in section) {
              section.notes.forEach((note) => {
                note.lyrics = note.lyrics?.replaceAll(/\\+"/g, '"');
              });
            }
          });
        });

        const songFilePath = `./public/songs/${song.id}.txt`;
        if (fs.existsSync(songFilePath)) {
          const oldSong = convertTxtToSong(fs.readFileSync(songFilePath, 'utf-8'));
          // keep old last update time if the song exists
          // song.lastUpdate = oldSong.lastUpdate ?? song.lastUpdate;
          song.artistOrigin = song.artistOrigin ?? oldSong.artistOrigin;
          song.shortId = oldSong.shortId;
        } else {
          addedSongs.push(song.id);
          song.shortId = ++maxId;

          if (song.video && song.duration === undefined) {
            try {
              if (!durationProbeClient) {
                durationProbeClient = await createYoutubeDurationProbeClient(8000);
              }

              song.duration = await durationProbeClient.getDuration(song.video);
              console.log(`Fetched duration for ${song.id}: ${song.duration}s`);
            } catch (error) {
              const errorMessage = error instanceof Error ? error.message : String(error);
              console.warn(`Could not fetch duration for ${song.id}: ${errorMessage}`);
            }
          }
        }

        fs.writeFileSync(songFilePath, convertSongToTxt(song));
        console.log(`Added/updated song ${song.id} - SID ${song.shortId}`);
      } catch (e) {
        console.warn(`Couldn't convert song`, songId, e, songTxt);
      }
    }

    console.log('Updating song data');
    execSync(`pnpm ts-node scripts/updateLastUpdate.ts ${addedSongs.map((s) => `./public/songs/${s}.txt`).join(' ')}`, {
      stdio: 'inherit',
    });

    console.log('Updating song stats');
    execSync(`pnpm ts-node scripts/generateSongStats.ts`, { stdio: 'inherit' });

    if (isSharedSongsAdminConfigured()) {
      console.log('Cleaning up promoted shared songs from Cloudflare pending pool');
      for (const songId of promotedSongs) {
        try {
          await removeSharedSongRecord(songId);
        } catch (error) {
          console.warn(`Failed to remove shared song ${songId} from Cloudflare pending pool`, error);
        }
      }
    } else {
      console.warn('Skipping shared songs cleanup: SHARED_SONGS_ADMIN_URL or SHARED_SONGS_ADMIN_TOKEN is missing');
    }

    require('../generateIndex');
  } finally {
    if (durationProbeClient) {
      await durationProbeClient.close();
    }
  }
})();
