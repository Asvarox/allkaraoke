import { OnlineRoomState } from '~/modules/online/protocol/types';
import { PLAYER_NUMBERS } from '~/modules/players/player-number';
import ParticipantSlot from '~/routes/online/components/participant-slot';
import { MicCheckSlotShell } from '~/routes/sing-a-song/song-selection/components/song-settings/mic-check/mic-check-slot';

interface Props {
  roomState: OnlineRoomState;
  selfId: string;
  /** Opens the name/color editor for the own row. */
  onEdit?: () => void;
  /** Offer the host the kick (and ban) control on other singers' rows. */
  canKick?: boolean;
}

/** The room's singers, using the same rows as the local mic check — a player-colored volume bar
 * filling in behind the name, with lobby tags (host/disconnected) and actions on the right.
 * Readiness isn't shown here: it's confirmed on the singing screen once the host starts. */
function ParticipantList({ roomState, selfId, onEdit, canKick }: Props) {
  return (
    <div className="flex flex-col gap-3" data-test="online-participant-list">
      {PLAYER_NUMBERS.map((playerNumber) => {
        const participant = roomState.participants.find((p) => p.playerNumber === playerNumber);

        // The room's free seats are shown too, so everyone can see there's still space to join
        if (!participant) {
          return (
            <MicCheckSlotShell
              key={`empty-${playerNumber}`}
              data-test={`online-empty-slot-${playerNumber}`}
              playerNumber={playerNumber}
              name={<span className="text-base">Free slot</span>}
              connected={false}
              volume={{ type: 'none' }}
            />
          );
        }

        return (
          <ParticipantSlot
            key={participant.id}
            data-test={`online-participant-${participant.playerNumber}`}
            participant={participant}
            selfId={selfId}
            hostId={roomState.hostId}
            showVote
            showTags
            onEdit={onEdit}
            canKick={canKick}
          />
        );
      })}
    </div>
  );
}

export default ParticipantList;
