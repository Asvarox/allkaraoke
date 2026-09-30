import { ReactNode } from 'react';

import { Icon } from '~/modules/elements/akui/icon';
import { PlayerStats, SongVote } from '~/modules/online/protocol/types';
import { Ping } from '~/routes/online/components/participant-parts';
import { cn } from '~/utils/cn';

interface Props {
  stats?: PlayerStats;
  /** The singer's thumbs up/down on the song currently on screen, if any. */
  vote?: SongVote | null;
  /** Extra tags and actions, appended after the ping and the vote. */
  children?: ReactNode;
  /** Laid out in flow — for a row that is itself a flex layout — instead of pinned to the row's end. */
  inFlow?: boolean;
}

/**
 * The trailing cluster of a singer row — ping, vote, and whatever tags the screen adds. Positioned
 * rather than in flow by default, so it never pushes the row's centered name off center, and above
 * the volume bar filling in behind it.
 */
function ParticipantBadges({ stats, vote, children, inFlow = false }: Props) {
  return (
    <span className={cn('z-1 flex items-center gap-1.5', inFlow ? 'shrink-0' : 'absolute inset-y-0 right-2')}>
      {stats && <Ping ms={stats.ping} className="opacity-60" />}
      {vote && (
        <Icon
          icon={vote === 'up' ? 'ic:baseline-thumb-up' : 'ic:baseline-thumb-down'}
          size={4}
          title={`Voted ${vote === 'up' ? 'for' : 'against'} this song`}
        />
      )}
      {children}
    </span>
  );
}

export default ParticipantBadges;
