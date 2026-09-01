import {
  isAuthorizedUnverifiedSongsAdmin,
  responseHeaders,
  unauthorizedResponse,
} from '../functions/unverified-songs-browser-admin-auth';
import { boardCacheKey, getBoardStub, LeaderboardEnv } from './leaderboard';

export interface LeaderboardAdminEnv extends LeaderboardEnv {
  ADMIN_PANEL_PASSWORD?: string;
}

/**
 * Authenticated list, delete, and a manual projection rebuild. Row ids only ever reach the admin UI
 * through here — the public board never carries them.
 */
export const handleLeaderboardAdmin = async (request: Request, env: LeaderboardAdminEnv) => {
  if (!isAuthorizedUnverifiedSongsAdmin(request, env)) return unauthorizedResponse();

  const board = getBoardStub(env);
  if (!board) {
    return new Response(JSON.stringify({ error: 'Leaderboard storage is not configured' }), {
      status: 500,
      headers: responseHeaders,
    });
  }

  if (request.method === 'GET') {
    return new Response(JSON.stringify({ entries: await board.listForAdmin() }), { headers: responseHeaders });
  }

  if (request.method === 'POST') {
    const result = await board.rebuild();

    // Same reasoning as the delete path: the point of rebuilding by hand is seeing the result now
    await caches.default.delete(boardCacheKey(request));

    return new Response(JSON.stringify(result), { headers: responseHeaders });
  }

  if (request.method === 'DELETE') {
    const id = new URL(request.url).searchParams.get('id')?.trim();

    if (!id) {
      return new Response(JSON.stringify({ error: 'Missing query parameter: id' }), {
        status: 400,
        headers: responseHeaders,
      });
    }

    if (!(await board.deleteRow(id))) {
      return new Response(JSON.stringify({ error: 'Record not found' }), { status: 404, headers: responseHeaders });
    }

    // Deletion is the moderation path, so the removed row must stop being served straight away
    // rather than linger for the read cache's `max-age`.
    await caches.default.delete(boardCacheKey(request));

    return new Response(JSON.stringify({ ok: true }), { headers: responseHeaders });
  }

  return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: responseHeaders });
};
