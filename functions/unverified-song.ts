import { getUnverifiedSongsKv, UnverifiedSongsEnv } from './unverified-songs-env';
import { getUnverifiedSong } from './unverified-songs-store';

type Env = UnverifiedSongsEnv;

const responseHeaders = {
  'Content-Type': 'application/json',
};

export const onRequest: PagesFunction<Env> = async ({ request, env }) => {
  try {
    const unverifiedSongsKv = getUnverifiedSongsKv(env);
    if (!unverifiedSongsKv) {
      return new Response(JSON.stringify({ error: 'Unverified songs storage is not configured' }), {
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

    const unverifiedSong = await getUnverifiedSong(unverifiedSongsKv, songId);

    if (!unverifiedSong) {
      return new Response(JSON.stringify({ error: 'Song not found' }), {
        status: 404,
        headers: responseHeaders,
      });
    }

    return new Response(
      JSON.stringify({
        sharedSongId: unverifiedSong.sharedSongId,
        externalSongId: unverifiedSong.sharedSongId,
        songId: unverifiedSong.songId,
        artist: unverifiedSong.artist,
        title: unverifiedSong.title,
        language: unverifiedSong.language,
        videoId: unverifiedSong.videoId,
        songTxt: unverifiedSong.songTxt,
      }),
      {
        headers: responseHeaders,
      },
    );
  } catch (error) {
    console.error('Failed to fetch unverified song', error);

    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: responseHeaders,
    });
  }
};
