import dotenv from 'dotenv';
import convertTxtToSong from '../../src/modules/Songs/utils/convertTxtToSong';
import {
  isSharedSongsAdminConfigured,
  removeSharedSongRecord,
  SharedSongRecord,
  upsertSharedSongRecord,
} from './sharedSongsAdminClient';

dotenv.config({ path: '.env.local' });

type PostHogEventRow = [
  songTxt: string | null,
  songId: string | null,
  eventName: 'share-song' | 'unshare-song',
  createdAt: string,
  userId: string | null,
];

const normalizeSongTxt = (songTxt: string) => songTxt.replaceAll('\\n', '\n');

const isValidYouTubeId = (videoId?: string) => {
  if (!videoId) {
    return false;
  }
  return /^[a-zA-Z0-9_-]{6,20}$/.test(videoId);
};

const validateSong = (songTxt: string) => {
  const normalizedSongTxt = normalizeSongTxt(songTxt);
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
    normalizedSongTxt,
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

  let processedCount = 0;
  let upsertedCount = 0;
  let removedCount = 0;
  let failedCount = 0;
  let maxCreatedAt = cursor ?? '';

  for (const [songTxt, songId, eventName, createdAt, userId] of response.results as PostHogEventRow[]) {
    processedCount += 1;

    if (!maxCreatedAt || new Date(createdAt).getTime() > new Date(maxCreatedAt).getTime()) {
      maxCreatedAt = createdAt;
    }

    try {
      if (eventName === 'unshare-song') {
        if (!songId) {
          continue;
        }
        await removeSharedSongRecord(songId);
        removedCount += 1;
        continue;
      }

      if (!songTxt) {
        continue;
      }

      const { song, normalizedSongTxt, validationErrors } = validateSong(songTxt);
      if (!song.id) {
        failedCount += 1;
        continue;
      }

      const now = Date.now();
      const record: SharedSongRecord = {
        externalSongId: song.id,
        songId: song.id,
        songTxt: normalizedSongTxt,
        artist: song.artist,
        title: song.title,
        language: song.language,
        videoId: song.video,
        verifiedAt: now,
        verificationStatus: validationErrors.length ? 'invalid' : 'valid',
        verificationErrors: validationErrors,
        firstSeenAt: now,
        lastSeenAt: now,
        sourceUserId: userId ?? '',
        sourceEventAt: new Date(createdAt).getTime(),
        removedAt: null,
      };

      await upsertSharedSongRecord(record);
      upsertedCount += 1;
    } catch (error) {
      failedCount += 1;
      console.warn('Failed to process shared song event', { songId, eventName, createdAt, error });
    }
  }

  console.log(
    JSON.stringify(
      {
        processedCount,
        upsertedCount,
        removedCount,
        failedCount,
        maxCreatedAt,
      },
      null,
      2,
    ),
  );
})();
