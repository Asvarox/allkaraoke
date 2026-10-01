import { ReactNode } from 'react';

import { PlayerColorDot } from '~/modules/elements/player-color-dot';
import { OnlineParticipant } from '~/modules/online/protocol/types';
import ParticipantBadges from '~/routes/online/components/participant-badges';
import {
  HostCrown,
  ParticipantActions,
  ParticipantName,
  ParticipantTags,
} from '~/routes/online/components/participant-parts';
import { useParticipantLive } from '~/routes/online/hooks/use-participant-live';
import { MicCheckSlotShell } from '~/routes/sing-a-song/song-selection/components/song-settings/mic-check/mic-check-slot';
import { cn } from '~/utils/cn';

interface Props {
  participant: OnlineParticipant;
  /** This browser's participant id — its own row reads the mic locally instead of over the wire. */
  selfId: string;
  /** Who the room's host is: drives the crown beside their name and gates the kick button. */
  hostId?: string | null;
  size?: 'regular' | 'compact';
  /** The singer's reported ping. */
  showPing?: boolean;
  /** Their thumbs up/down on the song currently being browsed. */
  showVote?: boolean;
  /** The `you` / `disconnected` pills, and the host's crown. */
  showTags?: boolean;
  /** Leading dot in the singer's player color, for rows too tight for the volume bar to read as
   * theirs at a glance. */
  showColorDot?: boolean;
  /** Offer the host the kick (and ban) control on other singers' rows. */
  canKick?: boolean;
  /** Opens the name/color editor. Rendered on the own row only. */
  onEdit?: () => void;
  /** Screen-specific extras, appended after the tags (a ready tick, …). */
  children?: ReactNode;
  className?: string;
  'data-test'?: string;
}

/**
 * One singer, rendered as the same mic-check row the local game uses: a player-colored volume bar
 * filling in behind the name, plus the trailing badge cluster each screen wants some subset of. The
 * song browser's player panel, the pause menu and the readiness overlay all come through here, so
 * the wiring around `MicCheckSlotShell` — stats lookup, vote resolution, local-vs-remote volume,
 * the host actions — exists once instead of three times. The lobby's table row is `StandingsRow`.
 */
function ParticipantSlot({
  participant,
  selfId,
  hostId = null,
  size,
  showPing = true,
  showVote = false,
  showTags = false,
  showColorDot = false,
  canKick = false,
  onEdit,
  children,
  className,
  'data-test': dataTest,
}: Props) {
  const { stats, vote, isSelf, isIdle, volume } = useParticipantLive(participant, selfId);

  const canEdit = onEdit !== undefined && isSelf;
  const showKick = canKick && hostId === selfId && !isSelf;
  const hasBadges = showPing || showVote || showTags || canEdit || showKick || children !== undefined;

  return (
    <MicCheckSlotShell
      data-test={dataTest}
      data-connected={participant.connected}
      data-idle={isIdle || undefined}
      data-vote={showVote ? (vote ?? 'none') : undefined}
      className={className}
      size={size}
      playerNumber={participant.playerNumber}
      // Stays centered in the row (the badges are positioned, not in flow); the width cap keeps a
      // long name from running underneath them, so it's only wanted when there are any
      name={
        <span className={cn('flex items-center gap-2', hasBadges && 'max-w-[calc(100%-16rem)]')}>
          {showColorDot && <PlayerColorDot number={participant.playerNumber} />}
          {showTags && <HostCrown participant={participant} hostId={hostId} />}
          <ParticipantName participant={participant} isIdle={isIdle} />
        </span>
      }
      connected={participant.connected}
      volume={volume}>
      {hasBadges && (
        <ParticipantBadges stats={showPing && !isIdle ? stats : undefined} vote={showVote ? vote : null}>
          {showTags && <ParticipantTags participant={participant} isSelf={isSelf} />}
          {children}
          <ParticipantActions participant={participant} onEdit={onEdit} showKick={showKick} isSelf={isSelf} />
        </ParticipantBadges>
      )}
    </MicCheckSlotShell>
  );
}

export default ParticipantSlot;
