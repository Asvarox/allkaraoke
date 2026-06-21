import dotenv from 'dotenv';
import { writeFile } from 'node:fs/promises';
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
import {
  isUnverifiedSongsAdminConfigured,
  UnverifiedSongRecord,
  upsertUnverifiedSongRecord,
} from './unverified-songs-admin-client';

dotenv.config({ path: '.env' });
dotenv.config({ path: '.env.local', override: true });

type PostHogEventRow = [
  songTxt: string | null,
  songId: string | null,
  eventName: 'share-song' | 'unshare-song',
  createdAt: string,
  userId: string | null,
];

type AnalyzedSongStatus = 'ADDED' | 'BROKEN' | 'SKIPPED';

type AnalyzedSongSummary = {
  id: string;
  status: AnalyzedSongStatus;
};

const DEFAULT_HOURS_FROM = 14;
const DEFAULT_HOURS_TO = 0;

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

const getHoursAgoDateLimit = (hoursBack: number) => new Date(Date.now() - hoursBack * 60 * 60 * 1000).toISOString();

const sanitizeUserIds = (userIds: string[]) => {
  const invalidUserId = userIds.find((id) => !/^[a-zA-Z0-9@._:-]+$/.test(id));
  if (invalidUserId) {
    throw new Error(`Invalid user id format: ${invalidUserId}`);
  }
  return userIds;
};

const buildQuery = (opts: { userIds: string[]; hoursFrom: number; hoursTo: number }) => {
  const userFilter = opts.userIds.length
    ? `and events.properties.$user_id IN(${opts.userIds.map((id) => `'${id.trim()}'`).join(',')})`
    : '';
  const cursorFilter = `and events.created_at > toDateTime('${getHoursAgoDateLimit(opts.hoursFrom)}')
              and events.created_at < toDateTime('${getHoursAgoDateLimit(opts.hoursTo)}')`;

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
  const builtInVideoIds = new Set(currentSongs.map((song) => song.video).filter((video): video is string => !!video));
  const summaryOutputPath = process.env.UNVERIFIED_SONGS_SUMMARY_PATH;
  const analyzedSongs = new Map<string, AnalyzedSongSummary>();

  const [hoursFromArg = '', hoursToArg = '', userIdsArg = ''] = process.argv.slice(2);

  if (!isUnverifiedSongsAdminConfigured()) {
    throw new Error('Shared songs admin endpoint env is not configured');
  }

  const hoursFrom = hoursFromArg !== '' ? Number(hoursFromArg) : DEFAULT_HOURS_FROM;
  const hoursTo = hoursToArg !== '' ? Number(hoursToArg) : DEFAULT_HOURS_TO;

  if (Number.isNaN(hoursFrom) || Number.isNaN(hoursTo)) {
    throw new Error(`Invalid hours range: hours_from="${hoursFromArg}" hours_to="${hoursToArg}"`);
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

  let processedCount = 0;
  let upsertedCount = 0;
  const removedCount = 0;
  let failedCount = 0;
  let discardedByDurationCount = 0;
  let skippedExistingInLibraryCount = 0;
  let maxCreatedAt = '';
  let durationProbeClient: Awaited<ReturnType<typeof createYoutubeDurationProbeClient>> | undefined;

  const rememberSongStatus = (id: string | undefined, status: AnalyzedSongStatus) => {
    const normalizedId = id?.trim();
    if (!normalizedId) {
      return;
    }

    analyzedSongs.set(normalizedId, {
      id: normalizedId,
      status,
    });
  };

  try {
    const response = await requestPostHog('query', {
      method: 'POST',
      body: JSON.stringify({
        query: {
          kind: 'HogQLQuery',
          query: buildQuery({
            userIds,
            hoursFrom,
            hoursTo,
          }),
        },
      }),
    });

    durationProbeClient = await createYoutubeDurationProbeClient(8000);

    for (const [songTxt, songId, eventName, createdAt, userId] of response.results as PostHogEventRow[]) {
      processedCount += 1;
      let currentSongId = songId ?? undefined;

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
          //   await removeUnverifiedSongRecord(songId);
          //   removedCount += 1;
          continue;
        }

        if (!songTxt) {
          rememberSongStatus(currentSongId, 'BROKEN');
          console.warn('Skipping share-song event with missing songTxt', { songId, createdAt, userId });
          continue;
        }

        const { song, validationErrors } = validateSong(songTxt);
        currentSongId = song.id || currentSongId;
        if (!song.id || validationErrors.length) {
          failedCount += 1;
          rememberSongStatus(currentSongId, 'BROKEN');
          continue;
        }

        applyCommonSharedSongImportProcessing(song);

        if (builtInSongIds.has(song.id) || (song.video && builtInVideoIds.has(song.video))) {
          skippedExistingInLibraryCount += 1;
          rememberSongStatus(song.id, 'SKIPPED');
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
          rememberSongStatus(song.id, 'BROKEN');
          console.warn('Discarding shared song because lyrics exceed video duration cap', {
            songId: song.id,
            loadedVideoDurationSeconds,
            maxAllowedDurationSeconds,
          });
          continue;
        }

        const now = Date.now();
        const record: UnverifiedSongRecord = {
          sharedSongId: song.id,
          songId: song.id,
          songTxt: convertSongToTxt(song),
          artist: song.artist,
          title: song.title,
          language: song.language,
          videoId: song.video,
          validatedAt: now,
          firstSeenAt: now,
          updated: now,
          lastSeenAt: now,
          sourceUserId: userId ?? '',
          sourceEventAt: new Date(createdAt).getTime(),
        };

        await upsertUnverifiedSongRecord(record);
        upsertedCount += 1;
        rememberSongStatus(song.id, 'ADDED');
      } catch (error) {
        failedCount += 1;
        rememberSongStatus(currentSongId, 'BROKEN');
        console.warn('Failed to process shared song event', { songId, eventName, createdAt, error });
      }
    }
  } finally {
    if (durationProbeClient) {
      try {
        await durationProbeClient.close();
      } catch (error) {
        console.warn('Failed to close YouTube duration probe client', { error });
      }
    }

    const summary = {
      processedCount,
      upsertedCount,
      removedCount,
      failedCount,
      discardedByDurationCount,
      skippedExistingInLibraryCount,
      maxCreatedAt,
      analyzedSongs: Array.from(analyzedSongs.values()),
    };

    if (summaryOutputPath) {
      try {
        await writeFile(summaryOutputPath, JSON.stringify(summary, null, 2));
      } catch (error) {
        console.warn('Failed to write unverified songs summary output', { summaryOutputPath, error });
      }
    }

    console.log(JSON.stringify(summary, null, 2));
  }
})();
