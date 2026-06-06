import {
  isAuthorizedSharedSongsAdmin,
  responseHeaders,
  unauthorizedResponse,
} from '../shared-songs-browser-admin-auth';
import { SharedSongUpdate, updateSharedSong } from '../shared-songs-store';

interface Env {
  ADMIN_PANEL_PASSWORD?: string;
  SHARED_SONGS_KV?: KVNamespace;
}

const isSharedSongUpdate = (payload: unknown): payload is SharedSongUpdate => {
  if (!payload || typeof payload !== 'object') {
    return false;
  }

  const update = payload as Partial<SharedSongUpdate>;

  return (
    typeof update.songId === 'string' &&
    typeof update.songTxt === 'string' &&
    typeof update.artist === 'string' &&
    typeof update.title === 'string' &&
    Array.isArray(update.language) &&
    update.language.every((language) => typeof language === 'string') &&
    typeof update.videoId === 'string'
  );
};

export const onRequest: PagesFunction<Env> = async ({ request, env }) => {
  if (!isAuthorizedSharedSongsAdmin(request, env)) {
    return unauthorizedResponse();
  }

  if (!env.SHARED_SONGS_KV) {
    return new Response(JSON.stringify({ error: 'Shared songs storage is not configured' }), {
      status: 500,
      headers: responseHeaders,
    });
  }

  try {
    if (request.method !== 'PUT') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: responseHeaders,
      });
    }

    const url = new URL(request.url);
    const externalSongId = url.searchParams.get('id')?.trim();

    if (!externalSongId) {
      return new Response(JSON.stringify({ error: 'Missing query parameter: id' }), {
        status: 400,
        headers: responseHeaders,
      });
    }

    const payload = await request.json();
    if (!isSharedSongUpdate(payload)) {
      return new Response(JSON.stringify({ error: 'Invalid song payload' }), {
        status: 400,
        headers: responseHeaders,
      });
    }

    const updated = await updateSharedSong(env.SHARED_SONGS_KV, externalSongId, payload);
    if (!updated) {
      return new Response(JSON.stringify({ error: 'Song not found' }), {
        status: 404,
        headers: responseHeaders,
      });
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: responseHeaders,
    });
  } catch (error) {
    console.error('Failed to update shared song', error);

    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: responseHeaders,
    });
  }
};
