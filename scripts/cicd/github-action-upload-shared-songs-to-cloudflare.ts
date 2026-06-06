import dotenv from 'dotenv';
import currentSongs from '../../public/songs/index.json';
import convertSongToTxt from '../../src/modules/songs/utils/convert-song-to-txt';
import convertTxtToSong from '../../src/modules/songs/utils/convert-txt-to-song';
import {
  applyCommonSharedSongImportProcessing,
  FALLBACK_VIDEO_DURATION_SECONDS,
  lyricsFitWithinVideoDuration,
  normalizeSharedSongTxt,
} from '../../src/modules/songs/utils/shared-song-import-processing';
import { createYoutubeDurationProbeClient } from '../youtube-duration-client';
import { isSharedSongsAdminConfigured, SharedSongRecord, upsertSharedSongRecord } from './shared-songs-admin-client';

dotenv.config({ path: '.env.local' });

type PostHogEventRow = [
  songTxt: string | null,
  songId: string | null,
  eventName: 'share-song' | 'unshare-song',
  createdAt: string,
  userId: string | null,
];

const isValidYouTubeId = (videoId?: string) => {
  if (!videoId) {
    return false;
  }
  return /^[a-zA-Z0-9_-]{6,20}$/.test(videoId);
};

const validateSong = (songTxt: string) => {
  const normalizedSongTxt = normalizeSharedSongTxt(songTxt);
  const song = convertTxtToSong(normalizedSongTxt);
  const validationErrors: string[] = [];

  if (!song.id) {
    validationErrors.push('missing-song-id');
  }

  if (!song.artist || !song.title) {
    validationErrors.push('missing-metadata');
  }

  if (!isValidYouTubeId(song.video)) {
    validationErrors.push('invalid-video-id');
  }

  song.tracks.forEach((track) => {
    track.sections.forEach((section) => {
      if ('notes' in section) {
        section.notes.forEach((note) => {
          if (note.start < 0 || note.length <= 0) {
            validationErrors.push('invalid-note-timing');
          }
        });
      }
    });
  });

  return {
    song,
    validationErrors: [...new Set(validationErrors)],
  };
};

const getDateLimit = (daysBack: number) => {
  const date = new Date();
  date.setDate(date.getDate() - daysBack);
  return date.toISOString();
};

const sanitizeUserIds = (userIds: string[]) => {
  const invalidUserId = userIds.find((id) => !/^[a-zA-Z0-9@._:-]+$/.test(id));
  if (invalidUserId) {
    throw new Error(`Invalid user id format: ${invalidUserId}`);
  }
  return userIds;
};

const sanitizeCursor = (cursor?: string) => {
  if (!cursor) {
    return undefined;
  }

  const parsedDate = new Date(cursor);
  if (Number.isNaN(parsedDate.getTime())) {
    throw new Error(`Invalid cursor format: ${cursor}`);
  }

  return parsedDate.toISOString();
};

const buildQuery = (opts: { userIds: string[]; daysFrom: number; daysTo: number; cursor?: string }) => {
  const userFilter = opts.userIds.length
    ? `and events.properties.$user_id IN(${opts.userIds.map((id) => `'${id.trim()}'`).join(',')})`
    : '';
  const cursorFilter = opts.cursor
    ? `and events.created_at > toDateTime('${opts.cursor}')`
    : `and events.created_at > toDateTime('${getDateLimit(opts.daysFrom)}')
              and events.created_at < toDateTime('${getDateLimit(opts.daysTo)}')`;

  return `
    select events.properties.song, events.properties.songId, events.event, events.created_at, events.properties.$user_id
    from events
    where events.event IN ('share-song', 'unshare-song')
      ${userFilter}
      ${cursorFilter}
    ORDER BY events.created_at ASC
    LIMIT 5000
  `;
};

(async () => {
  const { requestPostHog } = require('../utils.cjs');
  const builtInSongIds = new Set(currentSongs.map((song) => song.id));

  const [daysFromArg = '', daysToArg = '', cursorArg = '', userIdsArg = ''] = process.argv.slice(2);

  if (!isSharedSongsAdminConfigured()) {
    throw new Error('Shared songs admin endpoint env is not configured');
  }

  const daysFrom = daysFromArg !== '' ? Number(daysFromArg) : 4;
  const daysTo = daysToArg !== '' ? Number(daysToArg) : 0;

  if (Number.isNaN(daysFrom) || Number.isNaN(daysTo)) {
    throw new Error(`Invalid days range: days_from="${daysFromArg}" days_to="${daysToArg}"`);
  }

  const userIds = userIdsArg
    ? userIdsArg
        .split(',')
        .map((id) => id.trim())
        .filter(Boolean)
    : [];

  if (userIds.length > 0) {
    sanitizeUserIds(userIds);
  }
  const cursor = sanitizeCursor(cursorArg.trim() || undefined);

  const response = await requestPostHog('query', {
    method: 'POST',
    body: JSON.stringify({
      query: {
        kind: 'HogQLQuery',
        query: buildQuery({ userIds, daysFrom, daysTo, cursor }),
      },
    }),
  });

  const durationProbeClient = await createYoutubeDurationProbeClient(8000);

  let processedCount = 0;
  let upsertedCount = 0;
  const removedCount = 0;
  let failedCount = 0;
  let discardedByDurationCount = 0;
  let skippedExistingInLibraryCount = 0;
  let maxCreatedAt = cursor ?? '';

  try {
    for (const [songTxt, songId, eventName, createdAt, userId] of response.results as PostHogEventRow[]) {
      processedCount += 1;

      if (!maxCreatedAt || new Date(createdAt).getTime() > new Date(maxCreatedAt).getTime()) {
        maxCreatedAt = createdAt;
      }

      try {
        if (eventName === 'unshare-song') {
          //   if (!songId) {
          //     console.warn('Skipping unshare-song event with missing songId', { eventName, createdAt, userId });
          //     failedCount += 1;
          //     continue;
          //   }
          //   await removeSharedSongRecord(songId);
          //   removedCount += 1;
          continue;
        }

        if (!songTxt) {
          console.warn('Skipping share-song event with missing songTxt', { songId, createdAt, userId });
          continue;
        }

        const { song, validationErrors } = validateSong(songTxt);
        if (!song.id || validationErrors.length) {
          failedCount += 1;
          continue;
        }

        applyCommonSharedSongImportProcessing(song);

        if (builtInSongIds.has(song.id)) {
          skippedExistingInLibraryCount += 1;
          continue;
        }

        let loadedVideoDurationSeconds: number | undefined;
        if (song.video) {
          try {
            loadedVideoDurationSeconds = await durationProbeClient.getDuration(song.video);
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.warn(`Could not fetch duration for ${song.id}: ${errorMessage}`);
          }
        }

        const maxAllowedDurationSeconds = loadedVideoDurationSeconds ?? FALLBACK_VIDEO_DURATION_SECONDS;
        if (!lyricsFitWithinVideoDuration(song, maxAllowedDurationSeconds)) {
          failedCount += 1;
          discardedByDurationCount += 1;
          console.warn('Discarding shared song because lyrics exceed video duration cap', {
            songId: song.id,
            loadedVideoDurationSeconds,
            maxAllowedDurationSeconds,
          });
          continue;
        }

        const now = Date.now();
        const record: SharedSongRecord = {
          externalSongId: song.id,
          songId: song.id,
          songTxt: convertSongToTxt(song),
          artist: song.artist,
          title: song.title,
          language: song.language,
          videoId: song.video,
          verifiedAt: now,
          firstSeenAt: now,
          lastSeenAt: now,
          sourceUserId: userId ?? '',
          sourceEventAt: new Date(createdAt).getTime(),
        };

        await upsertSharedSongRecord(record);
        upsertedCount += 1;
      } catch (error) {
        failedCount += 1;
        console.warn('Failed to process shared song event', { songId, eventName, createdAt, error });
      }
    }
  } finally {
    await durationProbeClient.close();
  }

  console.log(
    JSON.stringify(
      {
        processedCount,
        upsertedCount,
        removedCount,
        failedCount,
        discardedByDurationCount,
        skippedExistingInLibraryCount,
        maxCreatedAt,
      },
      null,
      2,
    ),
  );
})();
