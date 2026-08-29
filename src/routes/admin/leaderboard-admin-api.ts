import { AdminBoardEntry } from '~/modules/leaderboard/types';

const LEADERBOARD_ADMIN_URL = '/leaderboard-admin';

class LeaderboardAdminApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

const assertOk = async (response: Response) => {
  if (response.ok) {
    return;
  }

  const payload = await response.json().catch(() => null);
  const message =
    payload && typeof payload === 'object' && 'error' in payload ? String(payload.error) : response.statusText;

  throw new LeaderboardAdminApiError(message, response.status);
};

const adminHeaders = (password: string) => ({
  'x-admin-panel-password': password,
});

export const listAdminLeaderboardEntries = async (password: string) => {
  const response = await fetch(LEADERBOARD_ADMIN_URL, { headers: adminHeaders(password) });
  await assertOk(response);

  const payload = (await response.json()) as { entries: AdminBoardEntry[] };

  return payload.entries;
};

/**
 * Re-runs the server-side projection over the stored rows. The board is rebuilt on every write, so
 * this is only needed after a deploy that changes what the projection selects — without it the
 * public board keeps its old contents until the next submission or the daily expiry alarm.
 */
export const rebuildAdminLeaderboardProjection = async (password: string) => {
  const response = await fetch(LEADERBOARD_ADMIN_URL, { method: 'POST', headers: adminHeaders(password) });
  await assertOk(response);

  return (await response.json()) as { entries: number };
};

export const deleteAdminLeaderboardEntry = async (password: string, id: string) => {
  const url = new URL(LEADERBOARD_ADMIN_URL, window.location.origin);
  url.searchParams.set('id', id);

  const response = await fetch(url.toString(), { method: 'DELETE', headers: adminHeaders(password) });
  await assertOk(response);
};
