import { Chip } from '~/modules/elements/akui/chip';
import { Icon } from '~/modules/elements/akui/icon';
import { OnlineParticipant } from '~/modules/online/protocol/types';
import KickPlayer from '~/routes/online/components/kick-player';
import { cn } from '~/utils/cn';

// The pieces shared by `ParticipantSlot` (the centered mic-check row) and `StandingsRow` (the lobby's
// table row), so the tags and the host actions exist once.

/** Ahead of the name rather than a pill in the tags, so "whose room is this" reads at a glance. */
export function HostCrown({ participant, hostId }: { participant: OnlineParticipant; hostId: string | null }) {
  if (participant.id !== hostId) return null;
  return (
    <Icon icon="mdi:crown" size={4} className="text-active shrink-0" title="Room host" data-test="participant-host" />
  );
}

export function ParticipantName({ participant, isIdle }: { participant: OnlineParticipant; isIdle: boolean }) {
  return (
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
}

/** The `you` and `disconnected` pills. */
export function ParticipantTags({ participant, isSelf }: { participant: OnlineParticipant; isSelf: boolean }) {
  return (
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
}

interface ActionsProps {
  participant: OnlineParticipant;
  /** Opens the name/color editor — offered on the own row only. */
  onEdit?: () => void;
  /** Offer the kick (and ban) control — the caller has checked this is the host looking at someone else. */
  showKick: boolean;
  isSelf: boolean;
}

/** The own row's edit control, or the host's kick control on everyone else's. */
export function ParticipantActions({ participant, onEdit, showKick, isSelf }: ActionsProps) {
  return (
    <>
      {onEdit !== undefined && isSelf && (
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
}

export function Ping({ ms, className }: { ms: number; className?: string }) {
  return (
    <span className={cn('text-xs tabular-nums', className)} data-test="participant-ping">
      {ms} ms
    </span>
  );
}
