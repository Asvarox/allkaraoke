import {
  isAuthorizedUnverifiedSongsAdmin,
  responseHeaders,
  unauthorizedResponse,
} from '../unverified-songs-browser-admin-auth';
import { getUnverifiedSongsKv, UnverifiedSongsEnv } from '../unverified-songs-env';
import { UnverifiedSongUpdate, updateUnverifiedSong } from '../unverified-songs-store';

interface Env extends UnverifiedSongsEnv {
  ADMIN_PANEL_PASSWORD?: string;
}

const isUnverifiedSongUpdate = (payload: unknown): payload is UnverifiedSongUpdate => {
  if (!payload || typeof payload !== 'object') {
    return false;
  }

  const update = payload as Partial<UnverifiedSongUpdate>;

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
  if (!isAuthorizedUnverifiedSongsAdmin(request, env)) {
    return unauthorizedResponse();
  }

  const unverifiedSongsKv = getUnverifiedSongsKv(env);
  if (!unverifiedSongsKv) {
    return new Response(JSON.stringify({ error: 'Unverified songs storage is not configured' }), {
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
    const sharedSongId = url.searchParams.get('id')?.trim();

    if (!sharedSongId) {
      return new Response(JSON.stringify({ error: 'Missing query parameter: id' }), {
        status: 400,
        headers: responseHeaders,
      });
    }

    const payload = await request.json();
    if (!isUnverifiedSongUpdate(payload)) {
      return new Response(JSON.stringify({ error: 'Invalid song payload' }), {
        status: 400,
        headers: responseHeaders,
      });
    }

    const updated = await updateUnverifiedSong(unverifiedSongsKv, sharedSongId, payload);
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
    console.error('Failed to update unverified song', error);

    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: responseHeaders,
    });
  }
};
