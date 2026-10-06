import { Chip } from '~/modules/elements/akui/chip';
import { Icon } from '~/modules/elements/akui/icon';

import { useVerifiedSongsTodayCount } from './verified-songs-counter';

export function VerifiedSongsCounter() {
  const count = useVerifiedSongsTodayCount();

  return (
    // The convert view's bottom bar is white, so the success text needs a darker shade to stay legible.
    <Chip
      variant="success"
      className="whitespace-nowrap text-green-800"
      title="Songs verified today (resets at 4am)"
      data-test="admin-verified-songs-today"
      data-count={count}>
      <Icon icon="ic:baseline-check" />
      {count} verified today
    </Chip>
  );
}
