import {
  getUnverifiedSongsAdminToken,
  getUnverifiedSongsKv,
  getUnverifiedSongsRequestToken,
  UnverifiedSongsEnv,
} from './unverified-songs-env';
import {
  regenerateIndex,
  removeUnverifiedSong,
  UnverifiedSongRecord,
  upsertUnverifiedSong,
} from './unverified-songs-store';

type Env = UnverifiedSongsEnv;

const responseHeaders = {
  'Content-Type': 'application/json',
};

const normalizeUnverifiedSongRecord = (payload: unknown): UnverifiedSongRecord | null => {
  if (!payload || typeof payload !== 'object') {
    return null;
  }

  const record = payload as Partial<UnverifiedSongRecord> & { externalSongId?: string; verifiedAt?: number };
  const sharedSongId = record.sharedSongId ?? record.externalSongId;
  const validatedAt = record.validatedAt ?? record.verifiedAt;
  const isValid =
    typeof sharedSongId === 'string' &&
    typeof record.songId === 'string' &&
    typeof record.songTxt === 'string' &&
    typeof record.artist === 'string' &&
    typeof record.title === 'string' &&
    Array.isArray(record.language) &&
    typeof record.videoId === 'string' &&
    typeof validatedAt === 'number' &&
    typeof record.firstSeenAt === 'number' &&
    typeof record.updated === 'number' &&
    typeof record.lastSeenAt === 'number' &&
    typeof record.sourceUserId === 'string' &&
    typeof record.sourceEventAt === 'number';

  return isValid
    ? ({ ...record, sharedSongId, externalSongId: sharedSongId, validatedAt } as UnverifiedSongRecord)
    : null;
};

export const onRequest: PagesFunction<Env> = async ({ request, env }) => {
  const expectedToken = getUnverifiedSongsAdminToken(env);
  const token = getUnverifiedSongsRequestToken(request);

  if (!expectedToken || token !== expectedToken) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: responseHeaders,
    });
  }

  const unverifiedSongsKv = getUnverifiedSongsKv(env);
  if (!unverifiedSongsKv) {
    return new Response(JSON.stringify({ error: 'Unverified songs storage is not configured' }), {
      status: 500,
      headers: responseHeaders,
    });
  }

  try {
    if (request.method === 'POST') {
      const payload = normalizeUnverifiedSongRecord(await request.json());

      if (!payload) {
        return new Response(JSON.stringify({ error: 'Invalid record payload' }), {
          status: 400,
          headers: responseHeaders,
        });
      }

      await upsertUnverifiedSong(unverifiedSongsKv, payload);

      return new Response(JSON.stringify({ ok: true }), {
        headers: responseHeaders,
      });
    }

    if (request.method === 'DELETE') {
      const url = new URL(request.url);
      const songId = url.searchParams.get('id')?.trim();

      if (!songId) {
        return new Response(JSON.stringify({ error: 'Missing query parameter: id' }), {
          status: 400,
          headers: responseHeaders,
        });
      }

      const removed = await removeUnverifiedSong(unverifiedSongsKv, songId);
      if (!removed) {
        return new Response(JSON.stringify({ error: 'Song not found' }), {
          status: 404,
          headers: responseHeaders,
        });
      }

      return new Response(JSON.stringify({ ok: true }), {
        headers: responseHeaders,
      });
    }

    if (request.method === 'PUT') {
      await regenerateIndex(unverifiedSongsKv);

      return new Response(JSON.stringify({ ok: true }), {
        headers: responseHeaders,
      });
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error('Failed to mutate unverified songs', error);

    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: responseHeaders,
    });
  }
};
