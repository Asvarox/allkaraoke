import { removeSharedSong, SharedSongRecord, upsertSharedSong } from './sharedSongsStore';

interface Env {
  SHARED_SONGS_ADMIN_TOKEN?: string;
  SHARED_SONGS_KV?: KVNamespace;
}

const responseHeaders = {
  'Content-Type': 'application/json',
};

const isSharedSongRecord = (payload: unknown): payload is SharedSongRecord => {
  if (!payload || typeof payload !== 'object') {
    return false;
  }

  const record = payload as Partial<SharedSongRecord>;
  return (
    typeof record.externalSongId === 'string' &&
    typeof record.songId === 'string' &&
    typeof record.songTxt === 'string' &&
    typeof record.artist === 'string' &&
    typeof record.title === 'string' &&
    Array.isArray(record.language) &&
    typeof record.videoId === 'string' &&
    typeof record.verifiedAt === 'number' &&
    typeof record.verificationStatus === 'string' &&
    Array.isArray(record.verificationErrors) &&
    typeof record.firstSeenAt === 'number' &&
    typeof record.lastSeenAt === 'number' &&
    typeof record.sourceUserId === 'string' &&
    typeof record.sourceEventAt === 'number' &&
    (typeof record.removedAt === 'number' || record.removedAt === null)
  );
};

export const onRequest: PagesFunction<Env> = async ({ request, env }) => {
  const expectedToken = env.SHARED_SONGS_ADMIN_TOKEN;
  const token = request.headers.get('x-shared-songs-admin-token');

  if (!expectedToken || token !== expectedToken) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: responseHeaders,
    });
  }

  if (!env.SHARED_SONGS_KV) {
    return new Response(JSON.stringify({ error: 'Shared songs storage is not configured' }), {
      status: 500,
      headers: responseHeaders,
    });
  }

  try {
    if (request.method === 'POST') {
      const payload = await request.json();

      if (!isSharedSongRecord(payload)) {
        return new Response(JSON.stringify({ error: 'Invalid record payload' }), {
          status: 400,
          headers: responseHeaders,
        });
      }

      await upsertSharedSong(env.SHARED_SONGS_KV, payload);

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

      const removed = await removeSharedSong(env.SHARED_SONGS_KV, songId);
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

    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error('Failed to mutate shared songs', error);

    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: responseHeaders,
    });
  }
};
