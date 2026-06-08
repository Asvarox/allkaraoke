import {
  isAuthorizedSharedSongsAdmin,
  responseHeaders,
  unauthorizedResponse,
} from '../shared-songs-browser-admin-auth';
import { listSharedSongs, regenerateIndex, removeSharedSong } from '../shared-songs-store';

interface Env {
  ADMIN_PANEL_PASSWORD?: string;
  SHARED_SONGS_KV?: KVNamespace;
}

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
    if (request.method === 'GET') {
      const songs = await listSharedSongs(env.SHARED_SONGS_KV);

      return new Response(JSON.stringify(songs), {
        headers: responseHeaders,
      });
    }

    if (request.method === 'DELETE') {
      const url = new URL(request.url);
      const externalSongId = url.searchParams.get('id')?.trim();

      if (!externalSongId) {
        return new Response(JSON.stringify({ error: 'Missing query parameter: id' }), {
          status: 400,
          headers: responseHeaders,
        });
      }

      const removed = await removeSharedSong(env.SHARED_SONGS_KV, externalSongId);
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
      await regenerateIndex(env.SHARED_SONGS_KV);

      return new Response(JSON.stringify({ ok: true }), {
        headers: responseHeaders,
      });
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error('Failed to administer shared songs', error);

    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: responseHeaders,
    });
  }
};
