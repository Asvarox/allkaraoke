import {
  isAuthorizedUnverifiedSongsAdmin,
  responseHeaders,
  unauthorizedResponse,
} from '../unverified-songs-browser-admin-auth';
import { getUnverifiedSongsKv, UnverifiedSongsEnv } from '../unverified-songs-env';
import { listUnverifiedSongs, regenerateIndex, removeUnverifiedSong } from '../unverified-songs-store';

interface Env extends UnverifiedSongsEnv {
  ADMIN_PANEL_PASSWORD?: string;
}

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
    if (request.method === 'GET') {
      const songs = await listUnverifiedSongs(unverifiedSongsKv);

      return new Response(JSON.stringify(songs), {
        headers: responseHeaders,
      });
    }

    if (request.method === 'DELETE') {
      const url = new URL(request.url);
      const sharedSongId = url.searchParams.get('id')?.trim();

      if (!sharedSongId) {
        return new Response(JSON.stringify({ error: 'Missing query parameter: id' }), {
          status: 400,
          headers: responseHeaders,
        });
      }

      const removed = await removeUnverifiedSong(unverifiedSongsKv, sharedSongId);
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
    console.error('Failed to administer unverified songs', error);

    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: responseHeaders,
    });
  }
};
