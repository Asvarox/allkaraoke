import { toSongVersion } from '../../src/modules/songs/song-version';
import { getSongQualityFlags, removeSongQualityFlag } from '../song-quality-flags-store';
import {
  isAuthorizedUnverifiedSongsAdmin,
  responseHeaders,
  unauthorizedResponse,
} from '../unverified-songs-browser-admin-auth';
import { getUnverifiedSongsKv, UnverifiedSongsEnv } from '../unverified-songs-env';

interface Env extends UnverifiedSongsEnv {
  ADMIN_PANEL_PASSWORD?: string;
}

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: responseHeaders });

export const onRequest: PagesFunction<Env> = async ({ request, env }) => {
  if (!isAuthorizedUnverifiedSongsAdmin(request, env)) {
    return unauthorizedResponse();
  }

  const kv = getUnverifiedSongsKv(env);
  if (!kv) {
    return jsonResponse({ error: 'Unverified songs storage is not configured' }, 500);
  }

  try {
    if (request.method === 'GET') {
      return jsonResponse(await getSongQualityFlags(kv));
    }

    if (request.method === 'DELETE') {
      const songId = new URL(request.url).searchParams.get('id')?.trim();
      if (!songId) {
        return jsonResponse({ error: 'Missing query parameter: id' }, 400);
      }

      const version = toSongVersion(new URL(request.url).searchParams.get('version'));
      const removed = await removeSongQualityFlag(kv, songId, version);

      return removed ? jsonResponse({ ok: true }) : jsonResponse({ error: 'Song not found' }, 404);
    }

    return jsonResponse({ error: 'Method not allowed' }, 405);
  } catch (error) {
    console.error('Failed to administer song quality flags', error);

    return jsonResponse({ error: 'Internal server error' }, 500);
  }
};
