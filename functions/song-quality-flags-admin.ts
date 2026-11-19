import {
  getSongQualityDismissals,
  normalizeSongQualityFlag,
  replaceSongQualityFlags,
  SongQualityFlag,
} from './song-quality-flags-store';
import {
  getUnverifiedSongsAdminToken,
  getUnverifiedSongsKv,
  getUnverifiedSongsRequestToken,
  UnverifiedSongsEnv,
} from './unverified-songs-env';

const responseHeaders = {
  'Content-Type': 'application/json',
};

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: responseHeaders });

// Called by the weekly CI job: GET reads dismissals, PUT replaces the whole set of flagged songs.
export const onRequest: PagesFunction<UnverifiedSongsEnv> = async ({ request, env }) => {
  const expectedToken = getUnverifiedSongsAdminToken(env);
  if (!expectedToken || getUnverifiedSongsRequestToken(request) !== expectedToken) {
    return jsonResponse({ error: 'Unauthorized' }, 401);
  }

  const kv = getUnverifiedSongsKv(env);
  if (!kv) {
    return jsonResponse({ error: 'Unverified songs storage is not configured' }, 500);
  }

  if (request.method === 'GET') {
    return jsonResponse({ dismissals: await getSongQualityDismissals(kv) });
  }

  if (request.method !== 'PUT') {
    return jsonResponse({ error: 'Method not allowed' }, 405);
  }

  try {
    const payload = (await request.json()) as { songs?: unknown };
    if (!payload || !Array.isArray(payload.songs)) {
      return jsonResponse({ error: 'Invalid payload' }, 400);
    }

    const songs = payload.songs.map(normalizeSongQualityFlag);
    if (songs.some((song) => song === null)) {
      return jsonResponse({ error: 'Invalid song flag in payload' }, 400);
    }

    await replaceSongQualityFlags(kv, songs as SongQualityFlag[]);

    return jsonResponse({ ok: true, count: songs.length });
  } catch (error) {
    console.error('Failed to store song quality flags', error);

    return jsonResponse({ error: 'Internal server error' }, 500);
  }
};
