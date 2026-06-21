export interface UnverifiedSongsEnv {
  UNVERIFIED_SONGS_ADMIN_TOKEN?: string;
  SHARED_SONGS_ADMIN_TOKEN?: string;
  UNVERIFIED_SONGS_KV?: KVNamespace;
  SHARED_SONGS_KV?: KVNamespace;
}

export const getUnverifiedSongsKv = (env: UnverifiedSongsEnv) => env.UNVERIFIED_SONGS_KV ?? env.SHARED_SONGS_KV;

export const getUnverifiedSongsAdminToken = (env: UnverifiedSongsEnv) =>
  env.UNVERIFIED_SONGS_ADMIN_TOKEN ?? env.SHARED_SONGS_ADMIN_TOKEN;

export const getUnverifiedSongsRequestToken = (request: Request) =>
  request.headers.get('x-unverified-songs-admin-token') ?? request.headers.get('x-shared-songs-admin-token');
