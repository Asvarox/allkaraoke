import { ReactNode } from 'react';

import { Chip } from '~/modules/elements/akui/chip';
import { Icon } from '~/modules/elements/akui/icon';
import { PlayerColorDot } from '~/modules/elements/player-color-dot';
import { useOnlinePlayersStats, useOnlineSongPreview, useOnlineSongVotes } from '~/modules/online/client/hooks';
import { OnlineParticipant, SongVote } from '~/modules/online/protocol/types';
import KickPlayer from '~/routes/online/components/kick-player';
import ParticipantBadges from '~/routes/online/components/participant-badges';
import { MicCheckSlotShell } from '~/routes/sing-a-song/song-selection/components/song-settings/mic-check/mic-check-slot';
import { cn } from '~/utils/cn';

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
  /** Who the room's host is: drives the crown beside their name and gates the kick button. */
  hostId?: string | null;
  size?: 'regular' | 'compact';
  /** `centered`: name over the volume bar, badges floating at its right end (the mic-check row).
   * `columns`: rank, name, badges, score in flow — for the narrow standings panel. */
  layout?: 'centered' | 'columns';
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
  /** Position in the standings, in a column of its own ahead of the name. `columns` layout only. */
  rank?: number;
  /** Ring the row in the focus colour — how the standings mark your own row. */
  highlight?: boolean;
  /** Screen-specific extras, appended after the tags (a ready tick, a `picking` pill, …). */
  children?: ReactNode;
  /** Top line of the right-hand column, over the ping — the standings' score. `columns` layout only. */
  trailing?: ReactNode;
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
  layout = 'centered',
  showPing = true,
  showVote = false,
  showTags = false,
  showColorDot = false,
  canKick = false,
  onEdit,
  rank,
  highlight = false,
  children,
  trailing,
  className,
  'data-test': dataTest,
}: Props) {
  const stats = useOnlinePlayersStats();
  const vote = useParticipantVote(participant.id);

  const isSelf = participant.id === selfId;
  // Away from the keyboard or on another tab: they stopped reporting, so their last volume and ping
  // are frozen rather than current. Never applies to the own row, which reads the mic locally.
  const isIdle = !isSelf && (stats[participant.id]?.idle ?? false);
  const canEdit = onEdit !== undefined && isSelf;
  const showKick = canKick && hostId === selfId && !isSelf;
  const inColumns = layout === 'columns';
  // In columns the ping and the edit/kick controls have columns of their own, outside the cluster
  const hasBadges = showVote || showTags || children !== undefined || (!inColumns && (showPing || canEdit || showKick));

  // Ahead of the name rather than a pill in the cluster, so "whose room is this" reads at a glance
  const crown = showTags && participant.id === hostId && (
    <Icon icon="mdi:crown" size={4} className="text-active shrink-0" title="Room host" data-test="participant-host" />
  );

  const name = (
    <span
      className={cn(
        'ph-no-capture truncate',
        !participant.connected && 'line-through opacity-50',
        isIdle && 'opacity-50',
      )}
      data-test="participant-name">
      {participant.name}
    </span>
  );

  const tags = showTags && (
    <>
      {isSelf && (
        <Chip variant="zinc" className="relative" data-test="participant-self">
          you
        </Chip>
      )}
      {!participant.connected && (
        <Chip variant="danger" className="relative">
          disconnected
        </Chip>
      )}
    </>
  );

  const actions = (
    <>
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
    </>
  );

  const badges = hasBadges && (
    <ParticipantBadges
      // In columns the cluster is in flow: `static` neutralises the inset it is positioned with
      className={cn(inColumns && 'static shrink-0')}
      stats={!inColumns && showPing && !isIdle ? stats[participant.id] : undefined}
      vote={showVote ? vote : null}>
      {tags}
      {children}
      {inColumns ? null : actions}
    </ParticipantBadges>
  );

  return (
    <MicCheckSlotShell
      data-test={dataTest}
      data-connected={participant.connected}
      data-idle={isIdle || undefined}
      data-vote={showVote ? (vote ?? 'none') : undefined}
      className={cn(highlight && 'border-active', className)}
      size={size}
      playerNumber={participant.playerNumber}
      // Centered: the width cap keeps a long name from running under the positioned badges.
      // Columns: unused — the whole row is laid out in `children` below.
      name={
        inColumns ? null : (
          <span className={`flex items-center gap-2 ${hasBadges ? 'max-w-[calc(100%-16rem)]' : ''}`}>
            {showColorDot && <PlayerColorDot number={participant.playerNumber} />}
            {crown}
            {name}
          </span>
        )
      }
      connected={participant.connected}
      // The own volume comes straight from the local mic pipeline (no re-render per frame);
      // everyone else's is the level they report to the room.
      volume={
        isSelf
          ? { type: 'local' }
          : {
              type: 'remote',
              volume: isIdle ? 0 : (stats[participant.id]?.volume ?? 0),
            }
      }>
      {inColumns ? (
        // `relative z-1` to sit above the volume bar the shell draws behind it
        <span className="relative z-1 flex w-full min-w-0 items-center gap-2 px-1">
          {rank !== undefined && (
            <span className="text-inactive w-4 shrink-0 text-left text-sm tabular-nums" data-test="participant-rank">
              {rank}
            </span>
          )}
          {showColorDot && <PlayerColorDot number={participant.playerNumber} />}
          {crown}
          <span className="flex min-w-0 flex-1 items-center justify-start gap-1.5">
            {name}
            {badges}
          </span>
          {/* Score over ping, right-aligned, the way a `ScoreboardRow` stacks them */}
          <span className="flex w-24 shrink-0 flex-col items-end justify-center">
            {trailing}
            {showPing && !isIdle && stats[participant.id] && (
              <span className="text-inactive text-xs tabular-nums" data-test="participant-ping">
                {stats[participant.id]!.ping} ms
              </span>
            )}
          </span>
          {/* Reserved on every row, so rows without a control keep the score column aligned */}
          {(onEdit !== undefined || canKick) && (
            <span className="flex w-5 shrink-0 items-center justify-center">{actions}</span>
          )}
        </span>
      ) : (
        badges
      )}
    </MicCheckSlotShell>
  );
}

export default ParticipantSlot;
