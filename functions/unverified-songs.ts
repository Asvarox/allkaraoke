import { getUnverifiedSongsKv, UnverifiedSongsEnv } from './unverified-songs-env';
import { listUnverifiedSongs } from './unverified-songs-store';

type Env = UnverifiedSongsEnv;

const responseHeaders = {
  'Content-Type': 'application/json',
};

export const onRequest: PagesFunction<Env> = async ({ request, env }) => {
  try {
    const url = new URL(request.url);
    const query = url.searchParams.get('query')?.trim();
    const rawLimit = Number(url.searchParams.get('limit') ?? '10');
    const limit = Math.min(25, Math.max(1, Number.isFinite(rawLimit) ? rawLimit : 10));

    if (!query) {
      return new Response(JSON.stringify({ error: 'Missing query parameter: query' }), {
        status: 400,
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

    const normalizedQuery = query.toLowerCase();
    const songs = (await listUnverifiedSongs(unverifiedSongsKv))
      .filter(
        (song) =>
          song.artist.toLowerCase().includes(normalizedQuery) ||
          song.title.toLowerCase().includes(normalizedQuery) ||
          song.language.some((language) => language.toLowerCase().includes(normalizedQuery)),
      )
      .slice(0, limit)
      .map((song) => ({
        sharedSongId: song.sharedSongId,
        externalSongId: song.sharedSongId,
        songId: song.songId,
        artist: song.artist,
        title: song.title,
        language: song.language,
        videoId: song.videoId,
      }));

    return new Response(JSON.stringify(songs), {
      headers: responseHeaders,
    });
  } catch (error) {
    console.error('Failed to fetch unverified songs', error);

    return new Response(JSON.stringify({ error: 'Failed to fetch unverified songs' }), {
      status: 500,
      headers: responseHeaders,
    });
  }
};
