import { Icon } from '~/modules/elements/akui/icon';

import { useVerifiedSongsTodayCount } from './verified-songs-counter';

export function VerifiedSongsCounter() {
  const count = useVerifiedSongsTodayCount();

  return (
    <span
      className="flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-sm whitespace-nowrap text-green-900"
      title="Songs verified today (resets at 4am)"
      data-test="admin-verified-songs-today"
      data-count={count}>
      <Icon icon="ic:baseline-check" />
      <b>{count}</b>
      <span>verified today</span>
    </span>
  );
}
