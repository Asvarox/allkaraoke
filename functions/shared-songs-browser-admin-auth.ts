interface AdminPasswordEnv {
  ADMIN_PANEL_PASSWORD?: string;
}

export const responseHeaders = {
  'Content-Type': 'application/json',
};

export const isAuthorizedSharedSongsAdmin = (request: Request, env: AdminPasswordEnv) => {
  const expectedPassword = env.ADMIN_PANEL_PASSWORD;
  const password = request.headers.get('x-admin-panel-password');

  return !!expectedPassword && password === expectedPassword;
};

export const unauthorizedResponse = () =>
  new Response(JSON.stringify({ error: 'Unauthorized' }), {
    status: 401,
    headers: responseHeaders,
  });
