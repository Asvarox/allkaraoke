import { getSharedSong } from './sharedSongsStore';

interface Env {
  SHARED_SONGS_KV?: KVNamespace;
}

const responseHeaders = {
  'Content-Type': 'application/json',
};

export const onRequest: PagesFunction<Env> = async ({ request, env }) => {
  try {
    if (!env.SHARED_SONGS_KV) {
      return new Response(JSON.stringify({ error: 'Shared songs storage is not configured' }), {
        status: 500,
        headers: responseHeaders,
      });
    }

    const url = new URL(request.url);
    const songId = url.searchParams.get('id')?.trim();

    if (!songId) {
      return new Response(JSON.stringify({ error: 'Missing query parameter: id' }), {
        status: 400,
        headers: responseHeaders,
      });
    }

    const sharedSong = await getSharedSong(env.SHARED_SONGS_KV, songId);

    if (!sharedSong) {
      return new Response(JSON.stringify({ error: 'Song not found' }), {
        status: 404,
        headers: responseHeaders,
      });
    }

    return new Response(
      JSON.stringify({
        externalSongId: sharedSong.externalSongId,
        songId: sharedSong.songId,
        artist: sharedSong.artist,
        title: sharedSong.title,
        language: sharedSong.language,
        videoId: sharedSong.videoId,
        songTxt: sharedSong.songTxt,
      }),
      {
        headers: responseHeaders,
      },
    );
  } catch (error) {
    console.error('Failed to fetch shared song', error);

    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: responseHeaders,
    });
  }
};
