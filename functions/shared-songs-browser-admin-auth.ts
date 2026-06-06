interface AdminPasswordEnv {
  SHARED_SONGS_ADMIN_PASSWORD?: string;
}

export const responseHeaders = {
  'Content-Type': 'application/json',
};

export const isAuthorizedSharedSongsAdmin = (request: Request, env: AdminPasswordEnv) => {
  const expectedPassword = env.SHARED_SONGS_ADMIN_PASSWORD;
  const password = request.headers.get('x-shared-songs-admin-password');

  return !!expectedPassword && password === expectedPassword;
};

export const unauthorizedResponse = () =>
  new Response(JSON.stringify({ error: 'Unauthorized' }), {
    status: 401,
    headers: responseHeaders,
  });
