import { listSharedSongs } from './shared-songs-store';

interface Env {
  SHARED_SONGS_KV?: KVNamespace;
}

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

    if (!env.SHARED_SONGS_KV) {
      return new Response(JSON.stringify({ error: 'Shared songs storage is not configured' }), {
        status: 500,
        headers: responseHeaders,
      });
    }

    const normalizedQuery = query.toLowerCase();
    const songs = (await listSharedSongs(env.SHARED_SONGS_KV))
      .filter(
        (song) =>
          song.artist.toLowerCase().includes(normalizedQuery) ||
          song.title.toLowerCase().includes(normalizedQuery) ||
          song.language.some((language) => language.toLowerCase().includes(normalizedQuery)),
      )
      .slice(0, limit)
      .map((song) => ({
        externalSongId: song.songId,
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
    console.error('Failed to fetch shared songs', error);

    return new Response(JSON.stringify({ error: 'Failed to fetch shared songs' }), {
      status: 500,
      headers: responseHeaders,
    });
  }
};
