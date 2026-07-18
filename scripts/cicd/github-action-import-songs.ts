import { execSync } from 'child_process';
import fs from 'fs';
import { writeFile } from 'node:fs/promises';

import dotenv from 'dotenv';

import currentSongs from '../../public/songs/index.json';
import convertSongToTxt from '../../src/modules/songs/utils/convert-song-to-txt';
import convertTxtToSong from '../../src/modules/songs/utils/convert-txt-to-song';
import {
  applyCommonSharedSongImportProcessing,
  normalizeSharedSongTxt,
} from '../../src/modules/songs/utils/shared-song-import-processing';
import { createYoutubeDurationProbeClient, type YoutubeDurationProbeClient } from '../youtube-duration-client';
import { isUnverifiedSongsAdminConfigured, removeUnverifiedSongRecord } from './unverified-songs-admin-client';

dotenv.config({ path: '.env' });
dotenv.config({ path: '.env.local', override: true });

type ImportedSongStatus = 'ADDED' | 'UPDATED' | 'DELETED' | 'SKIPPED' | 'BROKEN';

type ImportedSongSummary = {
  id: string;
  status: ImportedSongStatus;
};

(async () => {
  let maxId = currentSongs.reduce((acc, song) => Math.max(acc, song.shortId ?? 0), 0);
  let durationProbeClient: YoutubeDurationProbeClient | null = null;
  const summaryOutputPath = process.env.IMPORT_SONGS_SUMMARY_PATH;
  const importedSongs = new Map<string, ImportedSongSummary>();

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
  const rememberSongStatus = (id: string | undefined, status: ImportedSongStatus) => {
    const normalizedId = id?.trim();
    if (!normalizedId) {
      return;
    }

    importedSongs.set(normalizedId, {
      id: normalizedId,
      status,
    });
  };

  try {
    for (const [songTxt, songId] of response.results as [string | null, string | null][]) {
      let currentSongId = songId ?? undefined;

      try {
        if (!songTxt && songId) {
          if (addedSongs.includes(songId)) {
            fs.rmSync(`./public/songs/${songId}.txt`, { force: true });
            rememberSongStatus(songId, 'DELETED');
            console.log(`Deleting song ${songId}`);
          } else {
            rememberSongStatus(songId, 'SKIPPED');
            console.log(`Song ${songId} marked as deleted, but not found in added songs, leaving as is`);
          }
          continue;
        }

        if (!songTxt) {
          rememberSongStatus(currentSongId, 'SKIPPED');
          console.log('Skipping song event without song contents', songId);
          continue;
        }

        const song = convertTxtToSong(normalizeSharedSongTxt(songTxt));
        currentSongId = song.id || currentSongId;
        if (!song.id) {
          rememberSongStatus(currentSongId, 'BROKEN');
          console.log('Song has no ID', song, songId);
          continue;
        }

        applyCommonSharedSongImportProcessing(song);

        promotedSongs.add(song.id);

        const songFilePath = `./public/songs/${song.id}.txt`;
        if (fs.existsSync(songFilePath)) {
          const oldSong = convertTxtToSong(fs.readFileSync(songFilePath, 'utf-8'));
          // keep old last update time if the song exists
          // song.lastUpdate = oldSong.lastUpdate ?? song.lastUpdate;
          song.artistOrigin = song.artistOrigin ?? oldSong.artistOrigin;
          song.shortId = oldSong.shortId;
          rememberSongStatus(song.id, 'UPDATED');
        } else {
          addedSongs.push(song.id);
          song.shortId = ++maxId;
          rememberSongStatus(song.id, 'ADDED');
        }

        if (song.video) {
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

        fs.writeFileSync(songFilePath, convertSongToTxt(song));
        console.log(`Added/updated song ${song.id} - SID ${song.shortId}`);
      } catch (e) {
        rememberSongStatus(currentSongId, 'BROKEN');
        console.warn(`Couldn't convert song`, songId, e, songTxt);
      }
    }

    console.log('Updating song data');
    execSync(`pnpm tsx scripts/update-last-update.ts ${addedSongs.map((s) => `./public/songs/${s}.txt`).join(' ')}`, {
      stdio: 'inherit',
    });

    console.log('Updating song stats');
    execSync(`pnpm tsx scripts/generate-song-stats.ts`, { stdio: 'inherit' });

    if (isUnverifiedSongsAdminConfigured()) {
      console.log('Cleaning up promoted shared songs from Cloudflare pending pool');
      for (const songId of promotedSongs) {
        try {
          await removeUnverifiedSongRecord(songId);
        } catch (error) {
          console.warn(`Failed to remove shared song ${songId} from Cloudflare pending pool`, error);
        }
      }
    } else {
      console.warn(
        'Skipping shared songs cleanup: UNVERIFIED_SONGS_ADMIN_URL or UNVERIFIED_SONGS_ADMIN_TOKEN is missing',
      );
    }

    require('../generate-index');
  } finally {
    if (durationProbeClient) {
      await durationProbeClient.close();
    }

    const summary = {
      importedSongs: Array.from(importedSongs.values()),
    };

    if (summaryOutputPath) {
      try {
        await writeFile(summaryOutputPath, JSON.stringify(summary, null, 2));
      } catch (error) {
        console.warn('Failed to write import songs summary output', { summaryOutputPath, error });
      }
    }

    console.log(JSON.stringify(summary, null, 2));
  }
})();
