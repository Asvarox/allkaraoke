import { ReactNode } from 'react';

import { Icon } from '~/modules/elements/akui/icon';
import { PlayerStats, SongVote } from '~/modules/online/protocol/types';
import { cn } from '~/utils/cn';

interface Props {
  stats?: PlayerStats;
  /** The singer's thumbs up/down on the song currently on screen, if any. */
  vote?: SongVote | null;
  /** Extra tags and actions, appended after the ping and the vote. */
  children?: ReactNode;
  className?: string;
}

/**
 * The trailing cluster of a singer row — ping, vote, and whatever tags the screen adds. Positioned
 * rather than in flow, so it never pushes the row's centered name off center, and above the volume
 * bar filling in behind it.
 */
function ParticipantBadges({ stats, vote, children, className }: Props) {
  return (
    <span className={cn('absolute inset-y-0 right-2 z-1 flex items-center gap-1.5', className)}>
      {stats && (
        <span className="text-xs [font-variant-numeric:tabular-nums] opacity-60" data-test="participant-ping">
          {stats.ping} ms
        </span>
      )}
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
