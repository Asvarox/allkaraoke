import { ReactNode } from 'react';

import { Icon } from '~/modules/elements/akui/icon';
import { Tag } from '~/modules/elements/akui/tag';
import { PlayerColorDot } from '~/modules/elements/player-color-dot';
import { useOnlinePlayersStats, useOnlineSongPreview, useOnlineSongVotes } from '~/modules/online/client/hooks';
import { OnlineParticipant, SongVote } from '~/modules/online/protocol/types';
import KickPlayer from '~/routes/online/components/kick-player';
import ParticipantBadges from '~/routes/online/components/participant-badges';
import { MicCheckSlotShell } from '~/routes/sing-a-song/song-selection/components/song-settings/mic-check/mic-check-slot';

/**
 * A singer's thumbs up/down, but only while it still applies to the song on screen: votes are
 * remembered per song, so the one left over from a previously browsed song must not leak into a row.
 */
function useParticipantVote(participantId: string): SongVote | null {
  const votes = useOnlineSongVotes();
  const preview = useOnlineSongPreview();
  const vote = votes[participantId];

  return vote && vote.songId === preview?.songId ? vote.vote : null;
}

interface Props {
  participant: OnlineParticipant;
  /** This browser's participant id — its own row reads the mic locally instead of over the wire. */
  selfId: string;
  /** Who the room's host is: drives the `host` tag and gates the kick button. */
  hostId?: string | null;
  size?: 'regular' | 'compact';
  /** The singer's reported ping. */
  showPing?: boolean;
  /** Their thumbs up/down on the song currently being browsed. */
  showVote?: boolean;
  /** The `you` / `host` / `disconnected` pills. */
  showTags?: boolean;
  /** Leading dot in the singer's player color, for rows too tight for the volume bar to read as
   * theirs at a glance. */
  showColorDot?: boolean;
  /** Offer the host the kick (and ban) control on other singers' rows. */
  canKick?: boolean;
  /** Opens the name/color editor. Rendered on the own row only. */
  onEdit?: () => void;
  /** Screen-specific extras, appended after the tags (a score, a ready tick, …). */
  children?: ReactNode;
  className?: string;
  'data-test'?: string;
}

/**
 * One singer, rendered as the same mic-check row the local game uses: a player-colored volume bar
 * filling in behind the name, plus the trailing badge cluster each screen wants some subset of. The
 * lobby, the song browser's player panel, the pause menu and the readiness overlay all come through
 * here, so the wiring around `MicCheckSlotShell` — stats lookup, vote resolution, local-vs-remote
 * volume, the host actions — exists once instead of four times.
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
  const stats = useOnlinePlayersStats();
  const vote = useParticipantVote(participant.id);

  const isSelf = participant.id === selfId;
  const canEdit = onEdit !== undefined && isSelf;
  const showKick = canKick && hostId === selfId && !isSelf;
  const hasBadges = showPing || showVote || showTags || canEdit || showKick || children !== undefined;

  return (
    <MicCheckSlotShell
      data-test={dataTest}
      data-connected={participant.connected}
      data-vote={showVote ? (vote ?? 'none') : undefined}
      className={className}
      size={size}
      playerNumber={participant.playerNumber}
      // Stays centered in the row (the badges are positioned, not in flow); the width cap keeps a
      // long name from running underneath them, so it's only wanted when there are any
      name={
        <span className={`flex items-center gap-2 ${hasBadges ? 'max-w-[calc(100%-16rem)]' : ''}`}>
          {showColorDot && <PlayerColorDot number={participant.playerNumber} />}
          <span className={`truncate ${participant.connected ? '' : 'line-through opacity-50'}`}>
            {participant.name}
          </span>
        </span>
      }
      connected={participant.connected}
      // The own volume comes straight from the local mic pipeline (no re-render per frame);
      // everyone else's is the level they report to the room.
      volume={isSelf ? { type: 'local' } : { type: 'remote', volume: stats[participant.id]?.volume ?? 0 }}>
      {hasBadges && (
        <ParticipantBadges stats={showPing ? stats[participant.id] : undefined} vote={showVote ? vote : null}>
          {showTags && (
            <>
              {isSelf && (
                <Tag className="bg-black text-white" data-test="participant-self">
                  you
                </Tag>
              )}
              {participant.id === hostId && <Tag data-test="participant-host">host</Tag>}
              {!participant.connected && <Tag>disconnected</Tag>}
            </>
          )}
          {children}
          {canEdit && (
            <button
              type="button"
              onClick={onEdit}
              title="Change your name or color"
              className="hover:text-active flex cursor-pointer items-center opacity-75 hover:opacity-100"
              data-test="customize-button">
              <Icon icon="ic:baseline-edit" size={5} />
            </button>
          )}
          {showKick && <KickPlayer participant={participant} />}
        </ParticipantBadges>
      )}
    </MicCheckSlotShell>
  );
}

export default ParticipantSlot;
